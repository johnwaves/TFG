import fastify from '../server.js'
import { expect } from 'chai'

// Tests for user operations excluding create and delete
describe('User Operations Tests', () => {
    let adminToken
    let dniPaciente
    let dniTutor

    before(async () => {
        await fastify.ready()

        const adminLoginResponse = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: {
                dni: '10101010X',
                password: 'admin1234'
            }
        })
        expect(adminLoginResponse.statusCode).to.equal(200)
        adminToken = JSON.parse(adminLoginResponse.payload).token

        dniPaciente = '22334455B'
        dniTutor = '55667788E'
    })

    it('should get user by DNI', async () => {
        const userResponse = await fastify.inject({
            method: 'GET',
            url: `/api/users/${dniPaciente}`,
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(userResponse.statusCode).to.equal(200)
        const user = JSON.parse(userResponse.payload)
        expect(user.dni).to.equal(dniPaciente)
    })

    it('should get all users', async () => {
        const usersResponse = await fastify.inject({
            method: 'GET',
            url: '/api/users',
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(usersResponse.statusCode).to.equal(200)
        const users = JSON.parse(usersResponse.payload)
        expect(users).to.be.an('array')
        expect(users.length).to.be.greaterThan(0)
    })

    it('should get sanitario data', async () => {
        const sanitarioDNI = '33445566C'
        const sanitarioResponse = await fastify.inject({
            method: 'GET',
            url: `/api/users/sanitarios/${sanitarioDNI}`,
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(sanitarioResponse.statusCode).to.equal(200)
        const sanitario = JSON.parse(sanitarioResponse.payload)
        expect(sanitario).to.have.property('tipo')
        expect(sanitario.tipo).to.equal('FARMACEUTICO')
    })

    it('should get paciente data', async () => {
        const pacienteResponse = await fastify.inject({
            method: 'GET',
            url: `/api/users/pacientes/${dniPaciente}`,
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(pacienteResponse.statusCode).to.equal(200)
        const paciente = JSON.parse(pacienteResponse.payload)
        expect(paciente).to.have.property('idFarmacia')
        expect(paciente.idFarmacia).to.exist
    })

    it('should get tutor data', async () => {
        const tutorResponse = await fastify.inject({
            method: 'GET',
            url: `/api/users/tutores/${dniTutor}`,
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(tutorResponse.statusCode).to.equal(200)
        const tutor = JSON.parse(tutorResponse.payload)
        expect(tutor).to.have.property('idUser')
        expect(tutor.idUser).to.equal(dniTutor)
        expect(tutor).to.have.property('pacientes')
        expect(tutor.pacientes).to.be.an('array')
    })

    it('should update user information', async () => {
        const updateResponse = await fastify.inject({
            method: 'PUT',
            url: `/api/users/${dniPaciente}`,
            headers: {
                Authorization: `Bearer ${adminToken}`
            },
            payload: {
                telefono: '958999999'
            }
        })
        expect(updateResponse.statusCode).to.equal(200)
        const updatedUser = JSON.parse(updateResponse.payload).user
        expect(updatedUser).to.have.property('telefono')
        expect(updatedUser.telefono).to.equal('958999999')
    })
})
