const amqp = require("amqplib");

const URL = "amqp://127.0.0.1:5672";

const receiveMail = async () => {
  try {
    // 1. create connect
    const connection = await amqp.connect(URL);
    // 2. create channel
    const channel = await connection.createChannel();
    // 3. create exchange
    const exchangeName = "mail";
    await channel.assertExchange(exchangeName, "topic", { durable: false });
    // 4. create queue
    const { queue } = await channel.assertQueue("", { exclusive: true });
    // 5. binding
    const args = process.argv.splice(2);
    if (!args.length) {
      process.exit(0);
    }
    /**
     * * hop voi bat ky tu nao
     * # khop voi mot hoac nhieu tu bat ky
     */
    console.log("waiting queue " + queue + " topic:::" + args);
    args.forEach(async (key) => {
      await channel.bindQueue(queue, exchangeName, key);
    });
    await channel.consume(queue, (msg) => {
      console.log(
        `Routing key: ${
          msg.fields.routingKey
        }:: msg:::${msg.content.toString()}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

receiveMail();
