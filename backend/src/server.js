// Import the framework and instantiate it
import Fastify from 'fastify'
import { PORT } from './config/init.js'
import farmaciaRoutes from './routes/farmaciaRoutes.js'
import userRoutes from './routes/userRoutes.js'
import tratamientoRoutes from './routes/tratamientoRoutes.js'

const fastify = Fastify({
  logger: {
    level: 'trace',
    transport: {
      target: 'pino-pretty',
    }
  }
})

fastify.register(farmaciaRoutes)
fastify.register(userRoutes)
fastify.register(tratamientoRoutes)

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

export default fastify
//startServer()