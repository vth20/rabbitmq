const amqp = require("amqplib");

const URL = "amqp://127.0.0.1:5672";

const postVideo = async ({ msg }) => {
  try {
    // 1. create connect
    const connection = await amqp.connect(URL);
    // 2. create channel
    const channel = await connection.createChannel();
    // 3. create exchange
    const exchangeName = "video";
    await channel.assertExchange(exchangeName, "fanout", { durable: false });
    // 4. publish video
    await channel.publish(exchangeName, "", Buffer.from(msg));
    console.log(`[X] Send OK::: ${msg}`);
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.log(error);
  }
};
const msg = process.argv.slice(2).join(" ") || "Send";
postVideo({ msg });
