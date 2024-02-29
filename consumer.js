const amqp = require('amqplib');

async function consumer() {
	const connection = await amqp.connect('amqp://localhost:5672');
	const channel = await connection.createChannel();

	const queue = 'hello';
	const exchange = 'test';
	await channel.bindQueue(queue, exchange, '');
	await channel.assertQueue(queue);
	console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

	channel.consume(queue, (msg) => {
			if (msg !== null) {
					console.log(queue + " : " + exchange + " : " + " [x] Received %s", msg.content.toString());
					channel.ack(msg);
			}
	});
}

consumer()