const amqp = require('amqplib');

async function producer() {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'hello';
    const message = 'Hello World!';
		const exchange = 'test'
		publish(channel, 4, queue, message, exchange)
    // await channel.assertQueue(queue);
    // await channel.assertExchange(exchange, 'fanout', { durable: false });
    // await channel.bindQueue(queue, exchange, '');
    // // channel.sendToQueue(queue, Buffer.from(message));
    // channel.publish(exchange, '', Buffer.from(message));

    // console.log(" [x] Sent %s", message);

    // await channel.close();
    // await connection.close();
}

async function publish(channel, num, queue, message, exchange) {
	await channel.assertQueue(queue);
	if(exchange) {
		await channel.assertExchange(exchange, 'fanout', { durable: false });
		await channel.bindQueue(queue, exchange, '');
	}
	for(let i=0; i <= num; i++) {
		const data = `[${queue}-${exchange || 'xxx'} ${i}] : ${message}`
		if (exchange) {
			channel.publish(exchange, '', Buffer.from(data));
		} else {
			channel.sendToQueue(queue, Buffer.from(data));
		}
	}
	console.log(`[${queue}-${exchange}] Sent %s`);
}
producer()