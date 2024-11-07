// Import the framework and instantiate it
import Fastify from 'fastify'
import { PORT } from './config/init.js'
import cors from '@fastify/cors'; 
import farmaciaRoutes from './routes/farmaciaRoutes.js'
import userRoutes from './routes/userRoutes.js'
import tratamientoRoutes from './routes/tratamientoRoutes.js'
import authRoutes from './routes/authRoutes.js'
import jwtPlugin from './plugins/jwtPlugin.js'


const fastify = Fastify({
  logger: {
    level: 'trace',
    transport: {
      target: 'pino-pretty',
    }
  }
})

fastify.register(cors, { 
  origin: true, 
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
})
fastify.register(jwtPlugin)

// Compatibilidad con JSON  
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, fastify.getDefaultJsonParser('strict'))

fastify.register(farmaciaRoutes, { prefix: '/api' })
fastify.register(userRoutes, { prefix: '/api' })
fastify.register(tratamientoRoutes, { prefix: '/api' })
fastify.register(authRoutes, { prefix: '/api' })

// Ruta por defecto
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
startServer()
