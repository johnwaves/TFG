import farmaciaController from '../controllers/farmaciaController.js'

async function farmaciaRoutes(fastify, options) {
    fastify.post('/farmacias/create', {preValidation: [fastify.jwtAuth]}, farmaciaController.createFarmacia)
    fastify.get('/farmacias/:id', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaByID)
    fastify.get('/farmacias/nombre/:nombre', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaByNombre)
    fastify.get('/farmacias/:id/sanitarios', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaSanitariosByID)
    fastify.get('/farmacias/:id/pacientes', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaPacientesByID)
    fastify.put('/farmacias/:id', {preValidation: [fastify.jwtAuth]}, farmaciaController.updateFarmacia)
    fastify.delete('/farmacias/:id', {preValidation: [fastify.jwtAuth]}, farmaciaController.deleteFarmacia)
}

export default farmaciaRoutes