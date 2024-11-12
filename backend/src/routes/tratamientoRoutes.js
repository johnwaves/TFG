import tratamientoController from '../controllers/tratamientoController.js'

async function tratamientoRoutes(fastify, options) {
    fastify.post('/tratamientos/create', {preValidation: [fastify.jwtAuth]}, tratamientoController.createTratamiento)            
    fastify.put('/tratamientos/:id', {preValidation: [fastify.jwtAuth]}, tratamientoController.updateTratamiento)   
    fastify.get('/tratamientos/:id/lastregistro', {preValidation: [fastify.jwtAuth]}, tratamientoController.checkLastRegistro)        
    fastify.post('/tratamientos/registro', {preValidation: [fastify.jwtAuth]}, tratamientoController.registroTratamiento) 
    fastify.post('/tratamientos/paciente', { preValidation: [fastify.jwtAuth] }, tratamientoController.getAllTratamientosByDNI)
    fastify.get('/tratamientos/pendientes', { preValidation: [fastify.jwtAuth] }, tratamientoController.getPendingTratamientosByDNI) 
    fastify.post('/tratamientos/registrodatos', {preValidation: [fastify.jwtAuth]}, tratamientoController.registroDatosEnFarmacia) 
    fastify.get('/tratamientos/:id', {preValidation: [fastify.jwtAuth]}, tratamientoController.getTratamientoByID)
    fastify.post('/tratamientos/:id/adherencia', { preValidation: [fastify.jwtAuth] }, tratamientoController.getAdherenciaTratamiento)
    fastify.get('/tratamientos/adherencia/:dniPaciente', { preValidation: [fastify.jwtAuth] }, tratamientoController.getAdherenciaTotal)          
    fastify.delete('/tratamientos/:id', {preValidation: [fastify.jwtAuth]}, tratamientoController.deleteTratamiento)        
}

export default tratamientoRoutes