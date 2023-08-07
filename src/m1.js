const express = require('express');
const bodyParser = require('body-parser');
const amqplib = require('amqplib');
const {
	v4: uuidv4
} = require('uuid');
const logger = require('./logger');

const app = express();
app.use(bodyParser.json());

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost'

// Store results received from M2
const resultsStore = {};

let globalChannel;

// Establish a connection to RabbitMQ and set up the result queue
async function connectToMQ() {
	if (globalChannel) {
		return; // Return if the connection is already established
	}

	try {
		const connection = await amqplib.connect(`amqp://${rabbitmqHost}`);
		globalChannel = await connection.createChannel();

		// Set up a queue to listen for results from M2
		const resultsQueue = 'results_queue';
		await globalChannel.assertQueue(resultsQueue);

		globalChannel.consume(resultsQueue, (msg) => {
			if (!msg) {
				logger.warn('Undefined message received from results_queue');
				return;
			}

			const correlationId = msg.properties.correlationId;
			resultsStore[correlationId] = msg.content.toString();
			globalChannel.ack(msg);
		});
	} catch (error) {
		logger.error("Failed to connect to RabbitMQ:", error);
		throw error;
	}
}

// Send data to RabbitMQ for processing and return correlation ID
async function sendToRabbitMQ(data) {
	if (!globalChannel) {
		throw new Error('RabbitMQ channel not initialized');
	}

	const correlationId = uuidv4();
	const queueName = 'http_queue';
	await globalChannel.assertQueue(queueName);
	globalChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
		correlationId
	});

	return correlationId;
}

// Entry point for processing incoming data
app.post('/process', async (req, res) => {
	try {
		const correlationId = await sendToRabbitMQ(req.body);
		res.json({
			id: correlationId
		});
	} catch (error) {
		logger.error(`Failed to process request: ${error.message}`);
		res.status(500).send({
			message: 'Internal Server Error'
		});
	}
});

// Entry point for getting results based on correlation ID
app.get('/results/:id', (req, res) => {
	const result = resultsStore[req.params.id];
	if (!result) {
		return res.status(404).send({
			message: 'Результат не найден или все еще обрабатывается'
		});
	}
	res.json(JSON.parse(result));
});

// Start server after establishing connection with RabbitMQ
async function startServer() {
	await connectToMQ();
	const PORT = 3000;
	app.listen(PORT, () => {
		logger.info(`Service M1 started at http://localhost:${PORT}`);
	});
}

if (!process.env.TEST) {
	startServer();
}

module.exports = {
	app,
	startServer,
	globalChannel,
	connectToMQ
}