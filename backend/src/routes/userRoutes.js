import userController from '../controllers/userController.js'

async function userRouters(fastify, options) {
    fastify.post('/users/create', userController.createUser)               
    fastify.get('/users/:dni', userController.getUserByDNI)         
    fastify.get('/users', userController.getAllUsers)               
    fastify.put('/users/:dni', userController.updateUser)          
    fastify.delete('/users/:dni', userController.deleteUser)        
    fastify.get('/users/sanitarios/:dni', userController.getSanitarioData) 
    fastify.get('/users/pacientes/:dni', userController.getPacienteData)   
    fastify.get('/users/tutores/:dni', userController.getTutorData)  
}

export default userRouters