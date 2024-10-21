import tratamientoController from '../controllers/tratamientoController.js';

async function tratamientoRoutes(fastify, options) {
    fastify.post('/tratamientos/create', tratamientoController.createTratamiento);              
    fastify.put('/tratamientos/:id', tratamientoController.updateTratamiento);           
    fastify.post('/tratamientos/registro', tratamientoController.registroTratamiento);   
    fastify.get('/tratamientos/pendientes', tratamientoController.getPendingTratamientos); 
    fastify.post('/tratamientos/farmacia', tratamientoController.registroDatosEnFarmacia); 
    fastify.get('/tratamientos/:id', tratamientoController.getTratamientoByID);          
    fastify.delete('/tratamientos/:id', tratamientoController.deleteTratamiento);        
}

export default tratamientoRoutes;