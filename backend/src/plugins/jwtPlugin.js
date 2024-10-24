import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async function (fastify, options) {
    fastify.register(jwt, {
        secret: process.env.JWT_SIGNING_SECRET
      })

    fastify.decorate("jwtAuth", async function (request, reply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            reply.status(401).send({ err })
        }
    })
        
})