// Publisher
const amqp = require('amqplib');

async function publisher() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'logs';
    const message = 'Hello RabbitMQ!';

    channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.publish(exchange, '', Buffer.from(message));

    console.log(" [x] Sent %s", message);

    await channel.close();
    await connection.close();
}

// Subscriber
async function subscriber() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'logs';

    const assertQueue = await channel.assertQueue('', { exclusive: true });
    const queue = assertQueue.queue;

    channel.bindQueue(queue, exchange, '');

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log(" [x] Received %s", msg.content.toString());
            channel.ack(msg);
        }
    });
}

publisher();
subscriber();
