const amqp = require('amqplib');

async function producer() {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'hello';
    const message = 'Hello World!';

    await channel.assertQueue(queue);
    await channel.assertExchange('logs', 'fanout', { durable: false });
    await channel.bindQueue(queue, 'logs', '');
    // channel.sendToQueue(queue, Buffer.from(message));
    channel.publish('logs', '', Buffer.from('Hi Mom!'));

    console.log(" [x] Sent %s", message);

    // await channel.close();
    // await connection.close();
}

async function consumer() {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'hello';

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    await channel.assertQueue(queue);

    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log(" [x] Received %s", msg.content.toString());
            channel.ack(msg);
        }
    });
}

// producer();
consumer();
