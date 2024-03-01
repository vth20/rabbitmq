const amqp = require("amqplib");

const URL = "amqp://localhost:5672";
const receiveQueue = async () => {
  try {
    // 1. create connect
    const connection = await amqp.connect(URL);
    // 2. create channel
    const channel = await connection.createChannel();
    // 3. create name queue (kh co ten se tu generate)
    const nameQueue = "logs";
    // 4. create queue
    await channel.assertQueue(nameQueue, { durable: false });
    // 5. receive to queue
    await channel.consume(
      nameQueue,
      (msg) => console.log("message::: ", msg.content.toString()),
      { noAck: true } // khong can gui ack de xac nhan da nhan dung khong? TRUE/false
    );
    // close connection and channel
  } catch (error) {
    console.log(error);
  }
};
receiveQueue();
