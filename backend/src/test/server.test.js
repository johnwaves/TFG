import * as chai from 'chai'
import Fastify from 'fastify'
import { PORT } from '../init.js'

const { expect } = chai
const app = Fastify()

app.get('/', async (request, reply) => {
    return {hello: 'world'};
})

describe('API Endpoints', () => {
    before(async () => {
        await app.listen({ port: PORT})
    })

    after(async () => {
        await app.close();
    })

    it('should return hellow world on / GET', async () => {
        const res = await fetch(`http://localhost:${PORT}/`)
        const body = await res.json();

        expect (res.status).to.equal(200);
        expect(body).to.eql({ hello: 'world'})
    })

})