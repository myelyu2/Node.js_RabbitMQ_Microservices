const chai = require('chai');
const sinon = require('sinon');
const amqplib = require('amqplib');

// Make sure m2.js exports the startWorker function
const { startWorker } = require('../src/m2');

const { expect } = chai;

describe('Service M2', () => {
    let connectStub;
    let channelStub;

    beforeEach(() => {
        // Emulating Methods for a Channel
        channelStub = {
            assertQueue: sinon.stub(),
            consume: sinon.stub(),
            sendToQueue: sinon.stub(),
            ack: sinon.stub(),
            nack: sinon.stub()
        };
        
        // Emulating a RabbitMQ connection
        connectStub = sinon.stub(amqplib, 'connect').resolves({
            createChannel: sinon.stub().resolves(channelStub)
        });
    });

    afterEach(() => {
        // Restore original RabbitMQ connection method after each test
        connectStub.restore();
    });

    it('must process the correct task and send the result', async () => {
        // Definition of a simulation task
        const mockTask = { data: 'test' };

        // Emulating a call to the 'consume' method with our simulation task
        channelStub.consume.callsArgWith(1, {
            content: Buffer.from(JSON.stringify(mockTask)),
            properties: { correlationId: 'test-id' }
        });

        // Starting a workflow, which should then process our simulation task
        await startWorker();

        // Assertions to make sure the result was sent to the 'results_queue' and the message was acknowledged
        sinon.assert.calledOnce(channelStub.sendToQueue);
        sinon.assert.calledWith(channelStub.sendToQueue, 'results_queue', sinon.match.any, { correlationId: 'test-id' });
        sinon.assert.calledOnce(channelStub.ack);
    });

    it('must negatively validate an incorrect problem', async () => {
        // Emulating 'consume' method call with invalid content
        channelStub.consume.callsArgWith(1, { content: Buffer.from('not-a-valid-json') });

        // Starting a workflow that should then process the invalid content
        await startWorker();

        // Assertion to make sure invalid content is negatively acknowledged
        sinon.assert.calledOnce(channelStub.nack);
    });
});