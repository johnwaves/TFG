import fastify from '../server.js'
import { expect } from 'chai'

describe('Tests de Tratamientos', () => {
    let adminToken, farmaciaId, pacienteId1, pacienteId2, tratamientoId1, tratamientoId2, tratamientoId3, farmaceuticoId, tecnicoId

    before(async () => {
        await fastify.ready()

        const adminLoginResponse = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '10101010X', password: 'admin1234' }
        })
        if (adminLoginResponse.statusCode !== 200) {
            console.error('Error autenticando al administrador:', adminLoginResponse.payload)
        }
        expect(adminLoginResponse.statusCode).to.equal(200)
        adminToken = JSON.parse(adminLoginResponse.payload).token
    })

    it('Debería permitir al administrador crear una farmacia', async () => {
        const farmaciaResponse = await fastify.inject({
            method: 'POST',
            url: '/api/farmacias/create',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                nombre: 'Farmacia Nueva Esperanza',
                direccion: 'Calle Esperanza, 20, 18016 Granada'
            }
        })
        if (farmaciaResponse.statusCode !== 201) {
            console.error('Error creando la farmacia:', farmaciaResponse.payload)
        }
        expect(farmaciaResponse.statusCode).to.equal(201)
        farmaciaId = JSON.parse(farmaciaResponse.payload).id
    })

    it('Debería permitir al administrador crear sanitarios para la farmacia', async () => {
        const farmaceuticoResponse = await fastify.inject({
            method: 'POST',
            url: '/api/users/create',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                dni: '33445566G',
                password: 'farmaceutico567',
                email: 'luisa.garcia@example.com',
                nombre: 'Luisa',
                apellidos: 'Garcia Lopez',
                telefono: '958777777',
                fechaNac: '1979-03-12',
                direccion: 'Calle Esperanza, 24, 18016 Granada',
                role: 'SANITARIO',
                tipoSanitario: 'FARMACEUTICO',
                idFarmacia: farmaciaId
            }
        })
        if (farmaceuticoResponse.statusCode !== 201) {
            console.error('Error creando al farmacéutico:', farmaceuticoResponse.payload)
        }
        expect(farmaceuticoResponse.statusCode).to.equal(201)
        farmaceuticoId = '33445566G'

        const tecnicoResponse = await fastify.inject({
            method: 'POST',
            url: '/api/users/create',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                dni: '44556677H',
                password: 'tecnico567',
                email: 'francisco.lopez@example.com',
                nombre: 'Francisco',
                apellidos: 'Lopez Garcia',
                telefono: '958888888',
                fechaNac: '1992-11-20',
                direccion: 'Calle Esperanza, 25, 18016 Granada',
                role: 'SANITARIO',
                tipoSanitario: 'TECNICO',
                idFarmacia: farmaciaId
            }
        })
        if (tecnicoResponse.statusCode !== 201) {
            console.error('Error creando al técnico:', tecnicoResponse.payload)
        }
        expect(tecnicoResponse.statusCode).to.equal(201)
        tecnicoId = '44556677H'
    })

    it('Debería permitir a los sanitarios crear pacientes', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        })
        if (farmaceuticoLogin.statusCode !== 200) {
            console.error('Error autenticando al farmacéutico:', farmaceuticoLogin.payload)
        }
        expect(farmaceuticoLogin.statusCode).to.equal(200)
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token

        const pacienteResponse1 = await fastify.inject({
            method: 'POST',
            url: '/api/users/create',
            headers: { Authorization: `Bearer ${farmaceuticoToken}` },
            payload: {
                dni: '11223344E',
                password: 'paciente567',
                email: 'carmen.fernandez@example.com',
                nombre: 'Carmen',
                apellidos: 'Fernandez Gomez',
                telefono: '958555555',
                fechaNac: '2010-05-02',
                direccion: 'Calle Esperanza, 22, 18016 Granada',
                role: 'PACIENTE',
                idFarmacia: farmaciaId
            }
        })
        if (pacienteResponse1.statusCode !== 201) {
            console.error('Error creando al paciente por el farmacéutico:', pacienteResponse1.payload)
        }
        expect(pacienteResponse1.statusCode).to.equal(201)
        pacienteId1 = '11223344E'

        const tecnicoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '44556677H', password: 'tecnico567' }
        })
        if (tecnicoLogin.statusCode !== 200) {
            console.error('Error autenticando al técnico:', tecnicoLogin.payload)
        }
        expect(tecnicoLogin.statusCode).to.equal(200)
        const tecnicoToken = JSON.parse(tecnicoLogin.payload).token

        const pacienteResponse2 = await fastify.inject({
            method: 'POST',
            url: '/api/users/create',
            headers: { Authorization: `Bearer ${tecnicoToken}` },
            payload: {
                dni: '22334455F',
                password: 'paciente567',
                email: 'manuel.sanchez@example.com',
                nombre: 'Manuel',
                apellidos: 'Sanchez Ruiz',
                telefono: '958666666',
                fechaNac: '2011-06-15',
                direccion: 'Calle Esperanza, 23, 18016 Granada',
                role: 'PACIENTE',
                idFarmacia: farmaciaId
            }
        })
        if (pacienteResponse2.statusCode !== 201) {
            console.error('Error creando al paciente por el técnico:', pacienteResponse2.payload)
        }
        expect(pacienteResponse2.statusCode).to.equal(201)
        pacienteId2 = '22334455F'
    })

    it('Debería permitir al farmacéutico crear un tratamiento farmacológico para un paciente', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        })
        if (farmaceuticoLogin.statusCode !== 200) {
            console.error('Error autenticando al farmacéutico:', farmaceuticoLogin.payload)
        }
        expect(farmaceuticoLogin.statusCode).to.equal(200)
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token
    
        const tratamientoFarmacologicoResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/create',
            headers: { Authorization: `Bearer ${farmaceuticoToken}` },
            payload: {
                nombre: 'Tratamiento Antibiotico',
                tipo: 'FARMACOLOGICO',
                descripcion: 'Tratamiento para infección',
                idPaciente: pacienteId1,
                dosis: {
                    cantidad: 500,
                    intervalo: 8,
                    duracion: 10
                }
            }
        })
        if (tratamientoFarmacologicoResponse.statusCode !== 201) {
            console.error('Error creando el tratamiento farmacológico:', tratamientoFarmacologicoResponse.payload)
        }
        expect(tratamientoFarmacologicoResponse.statusCode).to.equal(201)
        const tratamiento = JSON.parse(tratamientoFarmacologicoResponse.payload)
        tratamientoId1 = tratamiento.id
    })

    it('Debería permitir al farmacéutico crear un tratamiento no farmacológico para un paciente', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        })
        expect(farmaceuticoLogin.statusCode).to.equal(200)
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token

        const tratamientoNoFarmacologicoResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/create',
            headers: { Authorization: `Bearer ${farmaceuticoToken}` },
            payload: {
                nombre: 'Rehabilitación',
                tipo: 'NO_FARMACOLOGICO',
                descripcion: 'Sesiones de fisioterapia',
                idPaciente: pacienteId1,
                fecha_fin: '2024-12-31'
            }
        })
        expect(tratamientoNoFarmacologicoResponse.statusCode).to.equal(201)
        const tratamiento = JSON.parse(tratamientoNoFarmacologicoResponse.payload)
        tratamientoId3 = tratamiento.id
    })

    it('Debería permitir al técnico crear un tratamiento farmacológico para un paciente', async () => {
        const tecnicoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '44556677H', password: 'tecnico567' }
        })
        expect(tecnicoLogin.statusCode).to.equal(200)
        const tecnicoToken = JSON.parse(tecnicoLogin.payload).token

        const tratamientoFarmacologicoTecnicoResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/create',
            headers: { Authorization: `Bearer ${tecnicoToken}` },
            payload: {
                nombre: 'Tratamiento Antiinflamatorio',
                tipo: 'FARMACOLOGICO',
                descripcion: 'Tratamiento para dolor muscular',
                idPaciente: pacienteId2,
                dosis: {
                    cantidad: 200,
                    intervalo: 6,
                    duracion: 7
                }
            }
        })
        expect(tratamientoFarmacologicoTecnicoResponse.statusCode).to.equal(201)
    })

    it('Debería permitir al técnico crear un tratamiento no farmacológico para un paciente', async () => {
        const tecnicoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '44556677H', password: 'tecnico567' }
        })
        if (tecnicoLogin.statusCode !== 200) {
            console.error('Error autenticando al técnico:', tecnicoLogin.payload)
        }
        expect(tecnicoLogin.statusCode).to.equal(200)
        const tecnicoToken = JSON.parse(tecnicoLogin.payload).token
    
        const tratamientoNoFarmacologicoTecnicoResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/create',
            headers: { Authorization: `Bearer ${tecnicoToken}` },
            payload: {
                nombre: 'Masoterapia',
                tipo: 'NO_FARMACOLOGICO',
                descripcion: 'Terapia de masajes para rehabilitación',
                idPaciente: pacienteId2,
                fecha_fin: '2024-12-31'
            }
        })
        if (tratamientoNoFarmacologicoTecnicoResponse.statusCode !== 201) {
            console.error('Error creando el tratamiento no farmacológico:', tratamientoNoFarmacologicoTecnicoResponse.payload)
        }
        expect(tratamientoNoFarmacologicoTecnicoResponse.statusCode).to.equal(201)
        const tratamiento = JSON.parse(tratamientoNoFarmacologicoTecnicoResponse.payload)
        tratamientoId2 = tratamiento.id
    })

    it('Debería permitir al farmacéutico modificar las dosis de los tratamientos farmacológicos de cada paciente', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        }) 
        if (farmaceuticoLogin.statusCode !== 200) {
            console.error('Error autenticando al farmacéutico:', farmaceuticoLogin.payload) 
        }
        expect(farmaceuticoLogin.statusCode).to.equal(200) 
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token 
    
        const modificarDosisResponse = await fastify.inject({
            method: 'PUT',
            url: `/api/tratamientos/${tratamientoId1}`,
            headers: { Authorization: `Bearer ${farmaceuticoToken}` },
            payload: {
                tipo: 'FARMACOLOGICO',
                dosis: {
                    cantidad: 750,
                    intervalo: 12,
                    duracion: 14
                }
            }
        }) 
        if (modificarDosisResponse.statusCode !== 200) {
            console.error('Error modificando las dosis del tratamiento:', modificarDosisResponse.payload) 
        }
        expect(modificarDosisResponse.statusCode).to.equal(200) 
    }) 
    
    it('No debería permitir al farmacéutico modificar el nombre o la descripción de ningún tratamiento', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        }) 
        if (farmaceuticoLogin.statusCode !== 200) {
            console.error('Error autenticando al farmacéutico:', farmaceuticoLogin.payload) 
        }
        expect(farmaceuticoLogin.statusCode).to.equal(200) 
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token 
    
        const modificarNombreDescripcionResponse = await fastify.inject({
            method: 'PUT',
            url: `/api/tratamientos/${tratamientoId1}`,
            headers: { Authorization: `Bearer ${farmaceuticoToken}` },
            payload: {
                nombre: 'Nuevo Nombre Tratamiento',
                descripcion: 'Nueva descripción del tratamiento'
            }
        }) 
        if (modificarNombreDescripcionResponse.statusCode !== 403) {
            console.error('Error al impedir la modificación del nombre o descripción del tratamiento:', modificarNombreDescripcionResponse.payload) 
        }
        expect(modificarNombreDescripcionResponse.statusCode).to.equal(403) 
    }) 
    
    it('No debería permitir al técnico modificar las dosis de los tratamientos farmacológicos', async () => {
        const tecnicoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '44556677H', password: 'tecnico567' }
        }) 
        if (tecnicoLogin.statusCode !== 200) {
            console.error('Error autenticando al técnico:', tecnicoLogin.payload) 
        }
        expect(tecnicoLogin.statusCode).to.equal(200) 
        const tecnicoToken = JSON.parse(tecnicoLogin.payload).token 
    
        const modificarDosisResponse = await fastify.inject({
            method: 'PUT',
            url: `/api/tratamientos/${tratamientoId2}`,
            headers: { Authorization: `Bearer ${tecnicoToken}` },
            payload: {
                tipo: 'FARMACOLOGICO',
                dosis: {
                    cantidad: 300,
                    intervalo: 6,
                    duracion: 5
                }
            }
        }) 
        if (modificarDosisResponse.statusCode !== 403) {
            console.error('Error al impedir la modificación de las dosis del tratamiento por el técnico:', modificarDosisResponse.payload) 
        }
        expect(modificarDosisResponse.statusCode).to.equal(403) 
    }) 
    
    it('No debería permitir al técnico modificar el nombre o la descripción de ningún tratamiento', async () => {
        const tecnicoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '44556677H', password: 'tecnico567' }
        }) 
        if (tecnicoLogin.statusCode !== 200) {
            console.error('Error autenticando al técnico:', tecnicoLogin.payload) 
        }
        expect(tecnicoLogin.statusCode).to.equal(200) 
        const tecnicoToken = JSON.parse(tecnicoLogin.payload).token 
    
        const modificarNombreDescripcionResponse = await fastify.inject({
            method: 'PUT',
            url: `/api/tratamientos/${tratamientoId2}`,
            headers: { Authorization: `Bearer ${tecnicoToken}` },
            payload: {
                nombre: 'Otro Nombre Tratamiento',
                descripcion: 'Otra descripción del tratamiento'
            }
        }) 
        if (modificarNombreDescripcionResponse.statusCode !== 403) {
            console.error('Error al impedir la modificación del nombre o descripción del tratamiento por el técnico:', modificarNombreDescripcionResponse.payload) 
        }
        expect(modificarNombreDescripcionResponse.statusCode).to.equal(403) 
    })    

    it('Debería permitir al sanitario obtener información de un tratamiento específico', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        }) 
        if (farmaceuticoLogin.statusCode !== 200) {
            console.error('Error autenticando al farmacéutico:', farmaceuticoLogin.payload) 
        }
        expect(farmaceuticoLogin.statusCode).to.equal(200) 
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token 
        
        const tratamientoInfoResponse = await fastify.inject({
            method: 'GET',
            url: `/api/tratamientos/${tratamientoId1}`,
            headers: { Authorization: `Bearer ${farmaceuticoToken}` }
        })
        expect(tratamientoInfoResponse.statusCode).to.equal(200)
        const tratamientoInfo = JSON.parse(tratamientoInfoResponse.payload)
        expect(tratamientoInfo).to.be.an('object')
        expect(tratamientoInfo).to.have.property('nombre', 'Tratamiento Antibiotico')
        expect(tratamientoInfo).to.have.property('tipo', 'FARMACOLOGICO')
    })

    it('Debería permitir al sanitario eliminar un tratamiento específico', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        }) 
        if (farmaceuticoLogin.statusCode !== 200) {
            console.error('Error autenticando al farmacéutico:', farmaceuticoLogin.payload) 
        }
        expect(farmaceuticoLogin.statusCode).to.equal(200) 
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token 

        const eliminarResponse = await fastify.inject({
            method: 'DELETE',
            url: `/api/tratamientos/${tratamientoId2}`,
            headers: { Authorization: `Bearer ${farmaceuticoToken}` }
        }) 
        if (eliminarResponse.statusCode !== 204) {
            console.error('Error eliminando el tratamiento:', eliminarResponse.payload) 
        }
        expect(eliminarResponse.statusCode).to.equal(204) 

        const verificarEliminacionResponse = await fastify.inject({
            method: 'GET',
            url: `/api/tratamientos/${tratamientoId2}`,
            headers: { Authorization: `Bearer ${farmaceuticoToken}` }
        }) 
        expect(verificarEliminacionResponse.statusCode).to.equal(404) 
    }) 

    it('Debería permitir a un paciente añadir un registro de cumplimiento a uno de sus tratamientos', async () => {
        const pacienteLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '11223344E', password: 'paciente567' }
        }) 
        if (pacienteLogin.statusCode !== 200) {
            console.error('Error autenticando al paciente:', pacienteLogin.payload) 
        }
        expect(pacienteLogin.statusCode).to.equal(200) 
        const pacienteToken1 = JSON.parse(pacienteLogin.payload).token 
    
        const primerRegistroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registro',
            headers: {
                Authorization: `Bearer ${pacienteToken1}`,
                idTratamiento: tratamientoId1, 
            },
            payload: {
                cumplimiento: true,
                detalles: 'Registro inicial de cumplimiento',
                fecha_registro: new Date().toISOString()
            }
        }) 
        if (primerRegistroResponse.statusCode !== 201) {
            console.error('Error al añadir el primer registro:', primerRegistroResponse.payload) 
        }
        expect(primerRegistroResponse.statusCode).to.equal(201) 
        const primerRegistro = JSON.parse(primerRegistroResponse.payload) 
        expect(primerRegistro).to.have.property('id') 
        expect(primerRegistro.cumplimiento).to.be.true 
        expect(primerRegistro.detalles).to.equal('Registro inicial de cumplimiento') 
    
        const tratamientoResponse = await fastify.inject({
            method: 'GET',
            url: `/api/tratamientos/${tratamientoId1}`, 
            headers: {
                Authorization: `Bearer ${pacienteToken1}`,
                idTratamiento: tratamientoId1, 
            },
        }) 
        expect(tratamientoResponse.statusCode).to.equal(200) 
        const tratamiento = JSON.parse(tratamientoResponse.payload) 
        const tratamientoIntervalo = tratamiento.dosis.intervalo  
    
        const segundoRegistroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registro',
            headers: {
                Authorization: `Bearer ${pacienteToken1}`,
                idTratamiento: tratamientoId1, 
            },
            payload: {
                cumplimiento: true,
                detalles: 'Segundo registro dentro del intervalo',
                fecha_registro: new Date().toISOString()
            }
        }) 
        if (segundoRegistroResponse.statusCode !== 400) {
            console.error('Error en el segundo registro dentro del intervalo:', segundoRegistroResponse.payload) 
        }
        expect(segundoRegistroResponse.statusCode).to.equal(400) 
        expect(JSON.parse(segundoRegistroResponse.payload).error).to.include(`Se podrá añadir un nuevo registro después del intervalo de ${tratamientoIntervalo} horas.`) 
    
        const fechaRegistroPosterior = new Date() 
        fechaRegistroPosterior.setHours(fechaRegistroPosterior.getHours() + tratamientoIntervalo) 
    
        const tercerRegistroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registro',
            headers: {
                Authorization: `Bearer ${pacienteToken1}`,
                idTratamiento: tratamientoId1, 
            },
            payload: {
                cumplimiento: true,
                detalles: 'Registro tras el intervalo permitido',
                fecha_registro: fechaRegistroPosterior.toISOString()
            }
        }) 
        if (tercerRegistroResponse.statusCode !== 201) {
            console.error('Error al añadir el tercer registro tras el intervalo:', tercerRegistroResponse.payload) 
        }
        expect(tercerRegistroResponse.statusCode).to.equal(201) 
        const tercerRegistro = JSON.parse(tercerRegistroResponse.payload) 
        expect(tercerRegistro).to.have.property('id') 
        expect(tercerRegistro.cumplimiento).to.be.true 
        expect(tercerRegistro.detalles).to.equal('Registro tras el intervalo permitido') 
    }) 

    it('Debería permitir a un paciente añadir un registro de cumplimiento a un tratamiento no farmacológico', async () => {
        // Autenticación del paciente
        const pacienteLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '11223344E', password: 'paciente567' }
        }) 
        if (pacienteLogin.statusCode !== 200) {
            console.error('Error autenticando al paciente:', pacienteLogin.payload) 
        }
        expect(pacienteLogin.statusCode).to.equal(200) 
        const pacienteToken1 = JSON.parse(pacienteLogin.payload).token 
    
        const primerRegistroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registro',
            headers: {
                Authorization: `Bearer ${pacienteToken1}`,
                idTratamiento: tratamientoId3
            },
            payload: {
                cumplimiento: true,
                detalles: 'Registro inicial de cumplimiento no farmacológico',
                fecha_registro: new Date().toISOString()
            }
        }) 
        if (primerRegistroResponse.statusCode !== 201) {
            console.error('Error al añadir el primer registro no farmacológico:', primerRegistroResponse.payload) 
        }
        expect(primerRegistroResponse.statusCode).to.equal(201) 
        const primerRegistro = JSON.parse(primerRegistroResponse.payload) 
        expect(primerRegistro).to.have.property('id') 
        expect(primerRegistro.cumplimiento).to.be.true 
        expect(primerRegistro.detalles).to.equal('Registro inicial de cumplimiento no farmacológico') 
    
        const segundoRegistroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registro',
            headers: {
                Authorization: `Bearer ${pacienteToken1}`,
                idTratamiento: tratamientoId3 
            },
            payload: {
                cumplimiento: true,
                detalles: 'Segundo registro dentro del mismo día',
                fecha_registro: new Date().toISOString()
            }
        }) 
    
        if (segundoRegistroResponse.statusCode !== 400) {
            console.error('Error en el segundo registro no farmacológico en el mismo día:', segundoRegistroResponse.payload) 
        }
        expect(segundoRegistroResponse.statusCode).to.equal(400) 
        expect(JSON.parse(segundoRegistroResponse.payload).error).to.include('Sólo se puede añadir un registro al día para este tipo de tratamiento.') 
    
        const fechaRegistroPosterior = new Date() 

        // Para no hacerlo el mismo día
        fechaRegistroPosterior.setDate(fechaRegistroPosterior.getDate() + 1) 
    
        const tercerRegistroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registro',
            headers: {
                Authorization: `Bearer ${pacienteToken1}`,
                idTratamiento: tratamientoId3 
            },
            payload: {
                cumplimiento: true,
                detalles: 'Registro tras el día permitido',
                fecha_registro: fechaRegistroPosterior.toISOString()
            }
        }) 
    
        if (tercerRegistroResponse.statusCode !== 201) {
            console.error('Error al añadir el tercer registro tras el día permitido:', tercerRegistroResponse.payload) 
        }
        expect(tercerRegistroResponse.statusCode).to.equal(201) 
        const tercerRegistro = JSON.parse(tercerRegistroResponse.payload) 
        expect(tercerRegistro).to.have.property('id') 
        expect(tercerRegistro.cumplimiento).to.be.true 
        expect(tercerRegistro.detalles).to.equal('Registro tras el día permitido') 
    }) 

    it('Debería permitir a un paciente obtener los tratamientos pendientes de inicio por DNI', async () => {
        const solicitanteLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '11223344E', password: 'paciente567' }
        }) 
        if (solicitanteLogin.statusCode !== 200) {
            console.error('Error autenticando al solicitante:', solicitanteLogin.payload) 
        }
        expect(solicitanteLogin.statusCode).to.equal(200) 
        const solicitanteToken = JSON.parse(solicitanteLogin.payload).token 
    
        const tratamientosPendientesResponse = await fastify.inject({
            method: 'GET',
            url: '/api/tratamientos/pendientes',
            headers: {
                Authorization: `Bearer ${solicitanteToken}`,
                'dnisolicitante': '11223344E',
                'dnisolicitado': '11223344E' 
            }            
        }) 
    
        if (tratamientosPendientesResponse.statusCode !== 200) {
            console.error('Error obteniendo los tratamientos pendientes:', tratamientosPendientesResponse.payload) 
        }
        expect(tratamientosPendientesResponse.statusCode).to.equal(200) 
        const tratamientosPendientes = JSON.parse(tratamientosPendientesResponse.payload) 
    
        console.log('Tratamientos pendientes:', tratamientosPendientes) 
    
        expect(tratamientosPendientes).to.be.an('array') 
        tratamientosPendientes.forEach(tratamiento => {
            expect(tratamiento).to.have.property('id') 
            expect(tratamiento).to.have.property('nombre') 
            expect(tratamiento).to.have.property('tipo') 
            expect(tratamiento).to.have.property('descripcion') 
            expect(tratamiento).to.have.property('fecha_inicio') 
            expect(tratamiento).to.have.property('fecha_fin') 
        }) 
    }) 
    
    it('Debería permitir al farmacéutico obtener tratamientos pendientes para un paciente específico', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        }) 
        if (farmaceuticoLogin.statusCode !== 200) {
            console.error('Error autenticando al farmacéutico:', farmaceuticoLogin.payload) 
        }
        expect(farmaceuticoLogin.statusCode).to.equal(200) 
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token 
    
        const pendientesResponse = await fastify.inject({
            method: 'GET',
            url: '/api/tratamientos/pendientes',
            headers: {
                Authorization: `Bearer ${farmaceuticoToken}`,
                'dnisolicitante': '33445566G',
                'dnisolicitado': '11223344E' 
            }
        }) 
    
        if (pendientesResponse.statusCode !== 200) {
            console.error('Error obteniendo tratamientos pendientes:', pendientesResponse.payload) 
        }
        expect(pendientesResponse.statusCode).to.equal(200) 
        const tratamientosPendientes = JSON.parse(pendientesResponse.payload) 
    
        console.log('Tratamientos pendientes:', tratamientosPendientes) 
    
        expect(tratamientosPendientes).to.be.an('array') 
        tratamientosPendientes.forEach(tratamiento => {
            expect(tratamiento).to.have.property('id') 
            expect(tratamiento).to.have.property('nombre') 
            expect(tratamiento).to.have.property('tipo') 
            expect(tratamiento).to.have.property('descripcion') 
            expect(tratamiento).to.have.property('fecha_inicio') 
            expect(tratamiento).to.have.property('fecha_fin') 
        }) 
    }) 

    it('Debería permitir al técnico de farmacia obtener tratamientos pendientes para un paciente específico', async () => {
        const tecnicoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '44556677H', password: 'tecnico567' }
        }) 
        if (tecnicoLogin.statusCode !== 200) {
            console.error('Error autenticando al técnico:', tecnicoLogin.payload) 
        }
        expect(tecnicoLogin.statusCode).to.equal(200) 
        const tecnicoToken = JSON.parse(tecnicoLogin.payload).token 
    
        const pendientesResponse = await fastify.inject({
            method: 'GET',
            url: '/api/tratamientos/pendientes',
            headers: {
                Authorization: `Bearer ${tecnicoToken}`,
                'dnisolicitante': '44556677H',
                'dnisolicitado': '11223344E' 
            }
        }) 
    
        if (pendientesResponse.statusCode !== 200) {
            console.error('Error obteniendo tratamientos pendientes:', pendientesResponse.payload) 
        }
        expect(pendientesResponse.statusCode).to.equal(200) 
        const tratamientosPendientes = JSON.parse(pendientesResponse.payload) 
    
        console.log('Tratamientos pendientes:', tratamientosPendientes) 
    
        expect(tratamientosPendientes).to.be.an('array') 
        tratamientosPendientes.forEach(tratamiento => {
            expect(tratamiento).to.have.property('id') 
            expect(tratamiento).to.have.property('nombre') 
            expect(tratamiento).to.have.property('tipo') 
            expect(tratamiento).to.have.property('descripcion') 
            expect(tratamiento).to.have.property('fecha_inicio') 
            expect(tratamiento).to.have.property('fecha_fin') 
        }) 
    }) 

    it('Debería permitir al farmacéutico añadir un registro en la farmacia a un tratamiento no farmacológico el 30 de octubre', async () => {
        const farmaceuticoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '33445566G', password: 'farmaceutico567' }
        }) 
        expect(farmaceuticoLogin.statusCode).to.equal(200) 
        const farmaceuticoToken = JSON.parse(farmaceuticoLogin.payload).token 
    
        // Para no repetir el día
        const fechaRegistroFarmaceutico = new Date('2024-10-30T10:00:00Z') 
    
        const registroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registrodatos',
            headers: {
                Authorization: `Bearer ${farmaceuticoToken}`,
                'dnisolicitante': '33445566G',
                'idtratamiento': tratamientoId3
            },
            payload: {
                detalles: 'Sesión de fisioterapia realizada exitosamente.',
                fecha_registro: fechaRegistroFarmaceutico.toISOString()
            }
        }) 
    
        if (registroResponse.statusCode !== 201) {
            console.error('Error al añadir el registro de datos adicionales:', registroResponse.payload) 
        }
        expect(registroResponse.statusCode).to.equal(201) 
    
        const registro = JSON.parse(registroResponse.payload) 
        expect(registro).to.be.an('object') 
        expect(registro).to.have.property('id') 
        expect(registro).to.have.property('cumplimiento', true) 
        expect(registro).to.have.property('detalles', 'Sesión de fisioterapia realizada exitosamente.') 
    }) 
    
    it('Debería permitir al técnico añadir un registro en la farmacia a un tratamiento no farmacológico el 31 de octubre', async () => {
        const tecnicoLogin = await fastify.inject({
            method: 'POST',
            url: '/api/login',
            payload: { dni: '44556677H', password: 'tecnico567' }
        }) 
        expect(tecnicoLogin.statusCode).to.equal(200) 
        const tecnicoToken = JSON.parse(tecnicoLogin.payload).token 
    
        const fechaRegistroTecnico = new Date('2024-10-31T10:00:00Z') 
    
        const registroResponse = await fastify.inject({
            method: 'POST',
            url: '/api/tratamientos/registrodatos',
            headers: {
                Authorization: `Bearer ${tecnicoToken}`,
                'dnisolicitante': '44556677H',
                'idtratamiento': tratamientoId3
            },
            payload: {
                detalles: 'Masoterapia aplicada con éxito.',
                fecha_registro: fechaRegistroTecnico.toISOString()
            }
        }) 
    
        if (registroResponse.statusCode !== 201) {
            console.error('Error al añadir el registro de datos adicionales por el técnico:', registroResponse.payload) 
        }
        expect(registroResponse.statusCode).to.equal(201) 
    
        const registro = JSON.parse(registroResponse.payload) 
        expect(registro).to.be.an('object') 
        expect(registro).to.have.property('id') 
        expect(registro).to.have.property('cumplimiento', true) 
        expect(registro).to.have.property('detalles', 'Masoterapia aplicada con éxito.') 
    })     
    
})
