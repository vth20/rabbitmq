const amqp = require("amqplib");

const URL = "amqp://127.0.0.1:5672";

const receive = async () => {
  try {
    // 1. create connect
    const connection = await amqp.connect(URL);
    // 2. create channel
    const channel = await connection.createChannel();
    // 3. create exchange
    const exchangeName = "video";
    await channel.assertExchange(exchangeName, "fanout", { durable: false });
    // 4. create queue
    const { queue } = await channel.assertQueue('', { exclusive: true });
    console.log(`name queue ${queue}`);
    // 5. binding
    await channel.bindQueue(queue, exchangeName, "");
    await channel.consume(
      queue,
      (msg) => {
        console.log(msg.content.toString());
      },
      {
        noAck: true,
      }
    );
    console.log(`[X] Receiving`);
  } catch (error) {
    console.log(error);
  }
};

receive();
