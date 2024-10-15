// Import the framework and instantiate it
import Fastify from 'fastify'
import { PORT } from './config/init.js'

const fastify = Fastify({
  logger: {
    level: 'trace',
    prettyPrint: true,
  }
})

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// Run the server!
const startServer = async () => {
    try {
        await fastify.listen({ port: PORT })
        console.log(`Server is running on port ${ PORT }`)

    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

startServer()