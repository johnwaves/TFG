export default async function setupAuthMiddleware(fastify, options) {

    fastify.decorate('authenticate', async function (request, reply) {
        try{
            await request.jwtVerify()
        } catch (err) {
            reply.code(401).send({ err })
        }
    })
}