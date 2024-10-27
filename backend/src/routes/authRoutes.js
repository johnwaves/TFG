import { login } from '../controllers/authController.js'

async function authRoutes(fastify, options) {

    fastify.post('/login', login)
    
}

export default authRoutes