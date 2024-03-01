const amqp = require("amqplib");

const URL = "amqp://localhost:5672";
const sendToQueue = async ({ msg }) => {
  try {
    // 1. create connect
    const connection = await amqp.connect(URL);
    // 2. create channel
    const channel = await connection.createChannel();
    // 3. create name queue (kh co ten se tu generate)
    const nameQueue = "logs";
    // 4. create queue
    await channel.assertQueue(nameQueue, { durable: false });
    // 5. send to queue
    await channel.sendToQueue(nameQueue, Buffer.from(msg));
    console.log("[X]");
    // close connection and channel
  } catch (error) {
    console.log(error);
  }
};
const msg = process.argv.slice(2).join(" ") || "Hello";
sendToQueue({ msg });
