import fastify from '../server.js'
import { expect } from 'chai'

describe('Creación de Usuarios y Eliminación en Cascada', () => {
  let adminToken
  let farmaciaId
  let dniPaciente2

  before(async () => {
    await fastify.ready()

    const adminLoginResponse = await fastify.inject({
      method: 'POST',
      url: '/login',
      payload: {
        dni: '10101010X',
        password: 'admin1234',
      }
    })
    expect(adminLoginResponse.statusCode).to.equal(200)
    adminToken = JSON.parse(adminLoginResponse.payload).token

    const farmaciaResponse = await fastify.inject({
      method: 'POST',
      url: '/farmacias/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        nombre: 'Farmacia La Salud',
        direccion: 'Calle Alhamar, 19, 18004 Granada'
      }
    })

    expect(farmaciaResponse.statusCode).to.equal(201)
    farmaciaId = JSON.parse(farmaciaResponse.payload).id
  })

  it('debería crear usuarios pacientes, sanitarios y un tutor', async () => {
    const paciente1Response = await fastify.inject({
      method: 'POST',
      url: '/users/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        dni: '11223344A',
        password: 'paciente123',
        email: 'juan.garcia@example.com',
        nombre: 'Juan',
        apellidos: 'García López',
        telefono: '958222222',
        fechaNac: '1985-05-15',
        direccion: 'Calle San Antón, 12, 18005 Granada',
        role: 'PACIENTE',
        idFarmacia: farmaciaId
      }
    })
    if (paciente1Response.statusCode !== 201) {
      console.error('Error al crear paciente 1:', paciente1Response.payload)
    }
    expect(paciente1Response.statusCode).to.equal(201)

    const paciente2Response = await fastify.inject({
      method: 'POST',
      url: '/users/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        dni: '22334455B',
        password: 'paciente123',
        email: 'maria.gomez@example.com',
        nombre: 'María',
        apellidos: 'Gómez Ruiz',
        telefono: '958333333',
        fechaNac: '2010-09-30',
        direccion: 'Calle Recogidas, 45, 18002 Granada',
        role: 'PACIENTE',
        idFarmacia: farmaciaId
      }
    })
    if (paciente2Response.statusCode !== 201) {
      console.error('Error al crear paciente 2:', paciente2Response.payload)
    }
    expect(paciente2Response.statusCode).to.equal(201)
    dniPaciente2 = '22334455B'

    const farmaceuticoResponse = await fastify.inject({
      method: 'POST',
      url: '/users/create',
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
    if (farmaceuticoResponse.statusCode !== 201) {
      console.error('Error al crear farmacéutico:', farmaceuticoResponse.payload)
    }
    expect(farmaceuticoResponse.statusCode).to.equal(201)

    const tecnicoResponse = await fastify.inject({
      method: 'POST',
      url: '/users/create',
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
    if (tecnicoResponse.statusCode !== 201) {
      console.error('Error al crear técnico:', tecnicoResponse.payload)
    }
    expect(tecnicoResponse.statusCode).to.equal(201)

    const tutorResponse = await fastify.inject({
      method: 'POST',
      url: '/users/create',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        dni: '55667788E',
        password: 'tutor123',
        email: 'ana.diaz@example.com',
        nombre: 'Ana',
        apellidos: 'Díaz Torres',
        telefono: '958666666',
        fechaNac: '1982-07-25',
        direccion: 'Calle Elvira, 8, 18010 Granada',
        role: 'TUTOR',
        dniPaciente: dniPaciente2
      }
    })
    if (tutorResponse.statusCode !== 201) {
      console.error('Error al crear tutor:', tutorResponse.payload)
    }
    expect(tutorResponse.statusCode).to.equal(201)
  })
})
