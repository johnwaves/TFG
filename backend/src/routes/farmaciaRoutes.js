import farmaciaController from '../controllers/farmaciaController.js'

async function farmaciaRoutes(fastify, options) {
    fastify.post('/farmacias/create', {preValidation: [fastify.jwtAuth]}, farmaciaController.createFarmacia)
    fastify.get('/farmacias', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmacias)
    fastify.get('/farmacias/:id', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaByID)
    fastify.get('/farmacias/nombre/:nombreFarmacia', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaByNombre)
    fastify.get('/farmacias/:id/sanitarios', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaSanitariosByID)
    fastify.get('/farmacias/:id/pacientes', {preValidation: [fastify.jwtAuth]}, farmaciaController.getFarmaciaPacientesByID)
    fastify.get('/farmacias/:id/tutores', { preValidation: [fastify.jwtAuth] }, farmaciaController.getFarmaciaTutoresByID)
    fastify.get('/farmacias/:id/pacientesnotutor', { preValidation: [fastify.jwtAuth] }, farmaciaController.getFarmaciaPacientesSinTutorByID);
    fastify.put('/farmacias/:id', {preValidation: [fastify.jwtAuth]}, farmaciaController.updateFarmacia)
    fastify.delete('/farmacias/:id', {preValidation: [fastify.jwtAuth]}, farmaciaController.deleteFarmacia)
    fastify.delete('/farmacias/:idFarmacia/pacientes/:dniPaciente', { preValidation: [fastify.jwtAuth] }, farmaciaController.removePacienteFromFarmacia);
    fastify.put('/farmacias/:idFarmacia/pacientes/:dniPaciente', { preValidation: [fastify.jwtAuth] }, farmaciaController.addPacienteToFarmacia);

}

export default farmaciaRoutes