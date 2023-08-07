const amqplib = require('amqplib');
const logger = require('./logger');

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost'

/**
  * Process the given task.
  * @param {Object} task - The task to process.
  * @returns {Object} - Processed task.
*/
async function processTask(task) {
    // Processing emulation
    task.processed = true;
    return task;
}

/**
  * Creates and returns a RabbitMQ channel.
  * @returns {Object} - RabbitMQ channel.
*/
async function createRabbitMQChannel() {
    const connection = await amqplib.connect(`amqp://${rabbitmqHost}`).catch(err => {
        throw new Error(`Failed to connect to RabbitMQ: ${err.message}`);
    });

    const channel = await connection.createChannel().catch(err => {
        throw new Error(`Failed to create channel: ${err.message}`);
    });

    return channel;
}

/**
  * Main function to start worker and process tasks.
*/
async function startWorker() {
    let channel;
    try {
        channel = await createRabbitMQChannel();
    } catch (error) {
        logger.error(error.message);
        return;
    }

    try {
        const queueName = 'http_queue';
        await channel.assertQueue(queueName);

        // Process incoming messages from http_queue
        channel.consume(queueName, async (msg) => {
            if (!msg) {
                logger.warn('Undefined message received from http_queue');
                return;
            }

            let task;
            try {
                task = JSON.parse(msg.content.toString());

            } catch (err) {
                logger.error(`Failed to parse message content: ${err.message}`);
                channel.nack(msg); // Negative message acknowledgment
                return;
            }

            const result = await processTask(task);

            // Send the result of the processed task back to the result queue
            channel.sendToQueue('results_queue', Buffer.from(JSON.stringify(result)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg); // Confirmation of the processed message
        });
    } catch (error) {
        logger.error(`Failed to start worker: ${error.message}`);
    }
}

startWorker();
module.exports = {
    startWorker
};