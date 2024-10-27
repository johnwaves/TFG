import tratamientoController from '../controllers/tratamientoController.js'

async function tratamientoRoutes(fastify, options) {
    fastify.post('/tratamientos/create', {preValidation: [fastify.jwtAuth]}, tratamientoController.createTratamiento)            
    fastify.put('/tratamientos/:id', {preValidation: [fastify.jwtAuth]}, tratamientoController.updateTratamiento)           
    fastify.post('/tratamientos/registro', {preValidation: [fastify.jwtAuth]}, tratamientoController.registroTratamiento)   
    fastify.get('/tratamientos/pendientes', { preValidation: [fastify.jwtAuth] }, tratamientoController.getPendingTratamientosByDNI) 
    fastify.post('/tratamientos/registrodatos', {preValidation: [fastify.jwtAuth]}, tratamientoController.registroDatosEnFarmacia) 
    fastify.get('/tratamientos/:id', {preValidation: [fastify.jwtAuth]}, tratamientoController.getTratamientoByID)          
    fastify.delete('/tratamientos/:id', {preValidation: [fastify.jwtAuth]}, tratamientoController.deleteTratamiento)        
}

export default tratamientoRoutes