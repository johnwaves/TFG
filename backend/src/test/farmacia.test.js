import fastify from '../server.js'
import { expect } from 'chai'

describe('Tests de Farmacia', () => {
  let adminToken
  let farmaciaId
  let dniPaciente

  before(async () => {
    await fastify.ready()

    const adminLoginResponse = await fastify.inject({
      method: 'POST',
      url: '/api/login',
      payload: {
        dni: '10101010X',
        password: 'admin1234',
      }
    })
    if (adminLoginResponse.statusCode !== 200) 
        console.error('Error en login:', adminLoginResponse.payload)

    expect(adminLoginResponse.statusCode).to.equal(200)
    adminToken = JSON.parse(adminLoginResponse.payload).token
  })

  it('Debería crear una farmacia', async () => {
    const farmaciaResponse = await fastify.inject({
      method: 'POST',
      url: '/api/farmacias/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        nombre: 'Farmacia Plaza Nueva',
        direccion: 'Plaza Nueva, 1, 18010 Granada'
      }
    })

    if (farmaciaResponse.statusCode !== 201) 
        console.error('Error al crear la farmacia:', farmaciaResponse.payload)

    expect(farmaciaResponse.statusCode).to.equal(201)
    farmaciaId = JSON.parse(farmaciaResponse.payload).id
  })

  it('Debería añadir sanitarios a la farmacia', async () => {
    const farmaceuticoResponse = await fastify.inject({
      method: 'POST',
      url: '/api/users/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        dni: '33445566C',
        password: 'farmaceutico123',
        email: 'carmen.martinez@example.com',
        nombre: 'Carmen',
        apellidos: 'Martínez Fernández',
        telefono: '958444444',
        fechaNac: '1978-04-10',
        direccion: 'Calle Reyes Católicos, 22, 18009 Granada',
        role: 'SANITARIO',
        tipoSanitario: 'FARMACEUTICO',
        idFarmacia: farmaciaId
      }
    })
    
    if (farmaceuticoResponse.statusCode !== 201) 
        console.error('Error al crear el farmacéutico:', farmaceuticoResponse.payload)
    
    expect(farmaceuticoResponse.statusCode).to.equal(201)

    const tecnicoResponse = await fastify.inject({
      method: 'POST',
      url: '/api/users/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        dni: '44556677D',
        password: 'tecnico123',
        email: 'luis.rodriguez@example.com',
        nombre: 'Luis',
        apellidos: 'Rodríguez Sánchez',
        telefono: '958555555',
        fechaNac: '1992-11-20',
        direccion: 'Calle Gran Vía, 1, 18001 Granada',
        role: 'SANITARIO',
        tipoSanitario: 'TECNICO',
        idFarmacia: farmaciaId
      }
    })
    if (tecnicoResponse.statusCode !== 201)
        console.error('Error al crear el técnico:', tecnicoResponse.payload)

    expect(tecnicoResponse.statusCode).to.equal(201)
  })

  it('Debería añadir pacientes y tutores a la farmacia', async () => {
    const pacienteResponse = await fastify.inject({
      method: 'POST',
      url: '/api/users/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        dni: '55667788E',
        password: 'paciente123',
        email: 'juan.garcia@example.com',
        nombre: 'Juan',
        apellidos: 'García López',
        telefono: '958666666',
        fechaNac: '2010-05-15',
        direccion: 'Calle San Antón, 12, 18005 Granada',
        role: 'PACIENTE',
        idFarmacia: farmaciaId
      }
    })

    if (pacienteResponse.statusCode !== 201) 
        console.error('Error al crear el paciente:', pacienteResponse.payload)

    expect(pacienteResponse.statusCode).to.equal(201)
    dniPaciente = '55667788E'

    const tutorResponse = await fastify.inject({
      method: 'POST',
      url: '/api/users/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        dni: '66778899F',
        password: 'tutor123',
        email: 'ana.diaz@example.com',
        nombre: 'Ana',
        apellidos: 'Díaz Torres',
        telefono: '958777777',
        fechaNac: '1982-07-25',
        direccion: 'Calle Elvira, 8, 18010 Granada',
        role: 'TUTOR',
        dniPaciente: dniPaciente
      }
    })

    if (tutorResponse.statusCode !== 201) 
        console.error('Error al crear el tutor:', tutorResponse.payload)

    expect(tutorResponse.statusCode).to.equal(201)
  })

  it('Debería obtener la farmacia por ID', async () => {
    const getResponse = await fastify.inject({
      method: 'GET',
      url: `/farmacias/${farmaciaId}`,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      }
    })

    if (getResponse.statusCode !== 200) 
        console.error('Error al obtener la farmacia:', getResponse.payload)

    expect(getResponse.statusCode).to.equal(200)
    const farmacia = JSON.parse(getResponse.payload)
    expect(farmacia).to.have.property('nombre', 'Farmacia Plaza Nueva')
    expect(farmacia).to.have.property('direccion', 'Plaza Nueva, 1, 18010 Granada')
    expect(farmacia.sanitarios).to.be.an('array').with.lengthOf.at.least(2)
    expect(farmacia.pacientes).to.be.an('array').with.lengthOf.at.least(1)
  })

  /*

  it('Debería obtener los sanitarios de la farmacia', async () => {
    const sanitariosResponse = await fastify.inject({
      method: 'GET',
      url: `/farmacias/${farmaciaId}/sanitarios`,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      }
    })

    if (sanitariosResponse.statusCode !== 200) {
        console.error('Error al obtener los sanitarios:', sanitariosResponse.payload);
    }

    expect(sanitariosResponse.statusCode).to.equal(200);
    
    try {
      const sanitarios = JSON.parse(sanitariosResponse.payload);
      expect(sanitarios).to.be.an('array');
      expect(sanitarios.some(s => s.tipo === 'FARMACEUTICO')).to.be.true;
      expect(sanitarios.some(s => s.tipo === 'TECNICO')).to.be.true;
    } catch (error) {
      console.error('Error al parsear la respuesta de sanitarios:', error.message, sanitariosResponse.payload);
      throw error;
    }
  })

  it('Debería obtener los pacientes de la farmacia', async () => {
    const pacientesResponse = await fastify.inject({
      method: 'GET',
      url: `/farmacias/${farmaciaId}/pacientes`,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      }
    })

    if (pacientesResponse.statusCode !== 200) 
        console.error('Error al obtener los pacientes:', pacientesResponse.payload)

    expect(pacientesResponse.statusCode).to.equal(200)
    const pacientes = JSON.parse(pacientesResponse.payload)
    expect(pacientes).to.be.an('array')
  })

  it('Debería eliminar la farmacia', async () => {
    const deleteResponse = await fastify.inject({
      method: 'DELETE',
      url: `/farmacias/${farmaciaId}`,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      }
    })

    expect(deleteResponse.statusCode).to.equal(200)
    const deleteMessage = JSON.parse(deleteResponse.payload)
    expect(deleteMessage).to.have.property('message', 'Farmacia deleted.')

    const getDeletedResponse = await fastify.inject({
      method: 'GET',
      url: `/farmacias/${farmaciaId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    if (getDeletedResponse.statusCode !== 404) 
        console.error('Error al obtener la farmacia eliminada:', getDeletedResponse.payload)
    expect(getDeletedResponse.statusCode).to.equal(404)
  })*/
})
