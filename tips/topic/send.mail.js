const amqp = require("amqplib");

const URL = "amqp://127.0.0.1:5672";

const sendMail = async () => {
  try {
    // 1. create connect
    const connection = await amqp.connect(URL);
    // 2. create channel
    const channel = await connection.createChannel();
    // 3. create exchange
    const exchangeName = "mail";
    await channel.assertExchange(exchangeName, "topic", { durable: false });
    // 4. publish email
    const args = process.argv.splice(2);
    const topic = args[0];
    const msg = args[1] || "Fixed!";
    console.log("msg:::" + msg + '---' + "topic:::" + topic);
    await channel.publish(exchangeName, topic, Buffer.from(msg));
    console.log(`[X] Send OK::: ${msg}`);
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.log(error);
  }
};
sendMail();
