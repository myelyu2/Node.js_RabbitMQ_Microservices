const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

process.env.TEST = 'true'

describe('Сервис M1', () => {
    let app, startServer;

    before(async () => {
        // Import module m1
        const m1Module = require('../src/m1');
        app = m1Module.app;
        startServer = m1Module.startServer;

        await startServer();
    });

    // Testing the endpoint to process requests and return a correlation ID
    it('должен обрабатывать запрос и возвращать корреляционный ID', async () => {
        const res = await chai.request(app).post('/process').send({ data: 'test' });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id');
    });

    after(() => {
        // To prevent caching issues, remove the m1 module from the Node cache
        delete require.cache[require.resolve('../src/m1')];
    });
});