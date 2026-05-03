const amqp = require("amqplib");

const QUEUE = "signals";

let channel = null;

// Initialize connection ONCE
const connectQueue = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });

    console.log("RabbitMQ connected");
  } catch (err) {
    console.error("RabbitMQ connection error:", err);
  }
};

// Send message to queue
const sendToQueue = (message) => {
  try {
    if (!channel) {
      console.error("Queue not initialized");
      return;
    }

    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify(message)),
      { persistent: true } // survives broker restart
    );

  } catch (err) {
    console.error("Queue send error:", err);
  }
};

module.exports = {
  connectQueue,
  sendToQueue,
};