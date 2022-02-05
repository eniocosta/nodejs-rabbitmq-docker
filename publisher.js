const amqplib = require('amqplib');
const amqpAddress = process.env.AMQP_URL || 'amqp://localhost:5673';

(async () => {
    const connection = await amqplib.connect(amqpAddress, 'heartbeat=60');
    const channel = await connection.createChannel(); //Create a channel for communication.

    try {
        console.log('Publishing...');

        const exchange = 'user.signed_up';
        const queue = 'user.sign_up_data';
        const routingKey = 'sign_up_data';

        //Make sure that the exchange and queue exists
        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        //If they don’t exist they will be created

        //Bind the exchange and the queue with the routing key
        await channel.bindQueue(queue, exchange, routingKey);

        const message = {
            id: 123,
            email: 'email@eniodomain.com',
            name: 'Enio Test',
            phone: '(+55)123456789',
            address: {
                street: 'Rua Joaozinho',
                number: '123',
                district: 'Center',
                city: 'Salvador',
                state: 'Bahia'
            }
        };
        
        await channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
        console.log('Message Published');

    } catch (e) {
        console.error('Error in Publishing Message. Error: ', e);
    } finally {
        await channel.close();
        await connection.close();

        console.info('Channel and Connection Closed');
    }
    process.exit(0);
})();