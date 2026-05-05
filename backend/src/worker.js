const amqp = require("amqplib");
const redis = require("./services/redisService");
const { getOrCreateWorkItem } = require("./services/workItemService");
const { Signal, connectMongo } = require("./services/mongoService");
const { handleAlert } = require("./alerts/alertService");

const QUEUE = "signals";

const startWorker = async () => {
  try {
    await connectMongo();

    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });

    channel.prefetch(10);

    console.log("Worker started...");

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      const signal = JSON.parse(msg.content.toString());

      signal.component_id = signal.component_id.trim().toUpperCase();

      const key = `component:${signal.component_id}`;

      try {
        // 🔥 Check Redis cache first for existing work item
        const cachedWorkItemId = await redis.get(key);
        if (cachedWorkItemId) {
          await Signal.create({
            ...signal,
            work_item_id: parseInt(cachedWorkItemId),
          });
          console.log(
            `Signal for ${signal.component_id} → cached WorkItem ${cachedWorkItemId}`
          );
          channel.ack(msg);
          return;
        }

        // 🔥 Redis lock to prevent duplicate work item creation
        const lockKey = `lock:component:${signal.component_id}`;
        const acquired = await redis.set(lockKey, "1", "EX", 100, "NX");

        if (!acquired) {
          // Another worker is processing same component, wait briefly and retry
          const cachedWorkItemId = await redis.get(key);
          if (cachedWorkItemId) {
            await Signal.create({
              ...signal,
              work_item_id: parseInt(cachedWorkItemId),
            });
            channel.ack(msg);
            return;
          }
        }

        const { id: workItemId, isNew } =
          await getOrCreateWorkItem(signal);

        await redis.set(key, workItemId, "EX", 100);
        await redis.del(lockKey);

        const saved = await Signal.create({
          ...signal,
          work_item_id: workItemId,
        });

        console.log("Saved to Mongo:", saved._id);
        console.log(
          `Signal for ${signal.component_id} → WorkItem ${workItemId}`
        );

        if (isNew) {
          handleAlert(signal);
        }

        channel.ack(msg);
      } catch (err) {
        console.error("Processing error:", err);

        channel.nack(msg, false, false);
      }
    });
  } catch (err) {
    console.error("Worker failed to start:", err);
  }
};

startWorker();