const amqp = require("amqplib");
const redis = require("./services/redisService");
const { createWorkItem } = require("./services/workItemService");

const QUEUE = "signals";

const startWorker = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    channel.prefetch(50);
    console.log("Worker started...");

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      const signal = JSON.parse(msg.content.toString());

      const key = `component:${signal.component_id}`;

      try {
        let workItemId = await redis.get(key);

        if (!workItemId) {
          workItemId = await createWorkItem(signal);

          // 10-second debounce window
          await redis.set(key, workItemId, "EX", 10);
        }

        console.log(
          `Signal for ${signal.component_id} → WorkItem ${workItemId}`
        );

        channel.ack(msg);
      } catch (err) {
        console.error("Processing error:", err);
      }
    });
  } catch (err) {
    console.error("Worker failed to start:", err);
  }
};

startWorker();
