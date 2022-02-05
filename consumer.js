const amqplib = require('amqplib');
const amqpAddress = process.env.AMQP_URL || 'amqp://localhost:5673';

async function processMessage(msg) {
    console.log(msg.content.toString(), 'Sending Email from API');
}

(async () => {
    const connection = await amqplib.connect(amqpAddress, "heartbeat=60");
    const channel = await connection.createChannel();

    // Number of messages retrieved at a time
    channel.prefetch(10);

    const queue = 'user.sign_up_data';

    process.once('SIGINT', async () => {
        console.log('Close the channel and connection before exiting the process');

        await channel.close();
        await connection.close();

        process.exit(0);
    });

    await channel.assertQueue(queue, { durable: true });

    await channel.consume(queue, async (message) => {
        console.log('Processing Messages');
        await processMessage(message);
        await channel.ack(message);
    }, {
        noAck: false,
        consumerTag: 'email_consumer'
    });
    console.log("Waiting for Messages");
})();