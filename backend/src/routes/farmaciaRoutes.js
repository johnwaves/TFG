import farmaciaController from '../controllers/farmaciaController.js'

async function farmaciaRoutes(fastify, options) {
    fastify.post('/farmacias/create', farmaciaController.createFarmacia)
    fastify.get('/farmacias/:id', farmaciaController.getFarmaciaByID)
    fastify.get('/farmacias/nombre/:nombre', farmaciaController.getFarmaciaByNombre)
    fastify.get('/farmacias/:id/sanitarios', farmaciaController.getFarmaciaSanitariosByID)
    fastify.get('/farmacias/:id/pacientes', farmaciaController.getFarmaciaPacientesByID)
    fastify.put('/farmacias/:id', farmaciaController.updateFarmacia)
    fastify.delete('/farmacias/:id', farmaciaController.deleteFarmacia)
}

export default farmaciaRoutes