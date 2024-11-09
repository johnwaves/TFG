import userController from '../controllers/userController.js'

async function userRouters(fastify, options) {
    fastify.post('/users/create', {preValidation: [fastify.jwtAuth]}, userController.createUser)               
    fastify.get('/users/:dni', {preValidation: [fastify.jwtAuth]}, userController.getUserByDNI)         
    fastify.get('/users', {preValidation: [fastify.jwtAuth]}, userController.getAllUsers)               
    fastify.put('/users/:dni', {preValidation: [fastify.jwtAuth]}, userController.updateUser)          
    fastify.delete('/users/:dni', {preValidation: [fastify.jwtAuth]}, userController.deleteUser)        
    fastify.get('/users/sanitarios/:dni', {preValidation: [fastify.jwtAuth]}, userController.getSanitarioData) 
    fastify.get('/users/pacientes/:dni', {preValidation: [fastify.jwtAuth]}, userController.getPacienteData)   
    fastify.get('/users/tutores/:dni', {preValidation: [fastify.jwtAuth]}, userController.getTutorData)  
    fastify.get('/users/pacientes/sinfarmacia', { preValidation: [fastify.jwtAuth] }, userController.getPacientesSinFarmacia)
}

export default userRouters