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

    channel.prefetch(50);
    console.log("Worker started...");

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      const signal = JSON.parse(msg.content.toString());

      const key = `component:${signal.component_id}`;

      try {
        let workItemId = await redis.get(key);
        let isNewWorkItem = false;  
        if (!workItemId) {
          workItemId = await getOrCreateWorkItem(signal);
          await redis.set(key, workItemId, "EX", 10);
          isNewWorkItem = true;
        }

        const saved = await Signal.create({
          ...signal,
          work_item_id: workItemId,
        });

        console.log("Saved to Mongo:", saved._id);
        console.log(
          `Signal for ${signal.component_id} → WorkItem ${workItemId}`,
        );

        channel.ack(msg);
        if(isNewWorkItem){
          handleAlert(signal);
        }
      } catch (err) {
        console.error("Processing error:", err);
      }
    });
  } catch (err) {
    console.error("Worker failed to start:", err);
  }
};

startWorker();
