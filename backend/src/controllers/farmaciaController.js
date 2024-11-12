import prisma from '../config/prisma.js'
import { ROLES, checkPermissions } from '../utils/roles.js'
import { deleteTratamiento } from './tratamientoController.js'

const createFarmacia = async (req, reply) => {
    try {
        const user = req.user
        const { nombre, direccion } = req.body

        if (user.role !== ROLES.ADMIN)
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can create farmacias.' })

        const existingFarmacia = await prisma.farmacia.findFirst({
            where: {
                OR: [
                    { nombre: { equals: nombre, mode: "insensitive" } },
                    { direccion: { equals: direccion, mode: "insensitive" } }
                ]
            }
        })

        if (existingFarmacia)
            return reply.status(400).send({ error: 'A farmacia with this name or address already exists.' })

        const farmacia = await prisma.farmacia.create({
            data: { nombre, direccion }
        })

        return reply.status(201).send(farmacia)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error creating farmacia.' })
    }
}

const getFarmacias = async (req, reply) => {
    try {
        const user = req.user

        if (user.role !== ROLES.ADMIN)
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can get farmacias.' })

        const farmacias = await prisma.farmacia.findMany({
            include: {
                sanitarios: true,
                pacientes: true
            }
        })

        return reply.status(200).send(farmacias)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error getting farmacias.' })
    }
}

const addPacienteToFarmacia = async (req, reply) => {
    try {
        const user = req.user
        const { idFarmacia, dniPaciente } = req.params

        if (user.role !== ROLES.ADMIN) 
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can add patients to farmacias.' })
        

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(idFarmacia) }
        })

        if (!farmacia) 
            return reply.status(404).send({ error: 'Farmacia not found.' })
        

        const paciente = await prisma.paciente.findUnique({
            where: { idUser: dniPaciente }
        })

        if (!paciente) 
            return reply.status(404).send({ error: 'Paciente not found.' })
        

        const updatedPaciente = await prisma.paciente.update({
            where: { idUser: dniPaciente },
            data: { idFarmacia: parseInt(idFarmacia) }
        })

        return reply.status(200).send({ message: 'Paciente added to farmacia successfully.', paciente: updatedPaciente })

    } catch (error) {
        console.error('Error adding patient to farmacia:', error)
        return reply.status(500).send({ error: 'Error adding patient to farmacia.' })
    }
}


const getFarmaciaByID = async (req, reply) => {
    try {
        const { id } = req.params
        const user = req.user
        let farmacia = null

        if (user.role === ROLES.ADMIN || user.role === ROLES.SANITARIO) {
            
            farmacia = await prisma.farmacia.findUnique({
                where: { id: parseInt(id) },
                include: {
                    sanitarios: true,
                    pacientes: true
                }
    
            })

        } else if (user.role === ROLES.PACIENTE || user.role === ROLES.TUTOR) {

            farmacia = await prisma.farmacia.findUnique({
                where: { id: parseInt(id) },
            })

        } else 
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' })
        

        if (!farmacia)
            return reply.status(404).send({ error: 'Farmacia not found.' })

        return reply.status(200).send(farmacia)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error getting farmacia.' })
    }
}

const getFarmaciaByNombre = async (req, reply) => {
    try {
        const { nombreFarmacia } = req.params

        const farmacia = await prisma.farmacia.findUnique({
            where: { nombre: nombreFarmacia },
            include: {
                sanitarios: true
            }
        })

        if (!farmacia)
            return reply.status(404).send({ error: 'Farmacia not found.' })

        return reply.status(200).send(farmacia)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error getting farmacia.' })
    }
}

const getFarmaciaSanitariosByID = async (req, reply) => {
    try {
        const { id } = req.params 
        const user = req.user 

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) {
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' }) 
        }

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            select: {
                sanitarios: {
                    select: {
                        user: {
                            select: {
                                dni: true,
                                password: true,
                                email: true,
                                nombre: true,
                                apellidos: true,
                                createdAt: true,
                                telefono: true,
                                fecha_nacimiento: true,
                                direccion: true,
                                foto: true,
                                role: true
                            }
                        },
                        idUser: true,
                        tipo: true,
                        idFarmacia: true,
                        tratamientos: true  
                    }
                }
            }
        })
        
        if (!farmacia)
            return reply.status(404).send({ error: 'Farmacia not found.' }) 
        

        const sanitarios = farmacia.sanitarios.map((sanitario) => ({
            dni: sanitario.user.dni,
            password: sanitario.user.password,
            email: sanitario.user.email,
            nombre: sanitario.user.nombre,
            apellidos: sanitario.user.apellidos,
            createdAt: sanitario.user.createdAt,
            telefono: sanitario.user.telefono,
            fecha_nacimiento: sanitario.user.fecha_nacimiento,
            direccion: sanitario.user.direccion,
            foto: sanitario.user.foto,
            role: sanitario.user.role,
            idUser: sanitario.idUser,
            tipo: sanitario.tipo,
            idFarmacia: sanitario.idFarmacia,
            tratamientos: sanitario.tratamientos
        })) 

        return reply.status(200).send(sanitarios) 

    } catch (error) {
        console.error(error) 
        return reply.status(500).send({ error: 'Error fetching sanitarios.' }) 
    }
} 

const getFarmaciaPacientesByID = async (req, reply) => {
    try {
        const user = req.user 
        const { id } = req.params 

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) {
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' }) 
        }

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            include: {
                pacientes: {
                    include: {
                        user: {
                            select: {
                                dni: true,
                                email: true,
                                nombre: true,
                                apellidos: true,
                                createdAt: true,
                                telefono: true,
                                fecha_nacimiento: true,
                                direccion: true,
                                foto: true,
                                role: true
                            }
                        },
                        tutor: {
                            include: {
                                user: {
                                    select: {
                                        dni: true,
                                        nombre: true,
                                        apellidos: true,
                                        email: true
                                    }
                                }
                            }
                        },
                        tratamientos: true
                    }
                }
            }
        }) 

        if (!farmacia) {
            return reply.status(404).json({ error: 'Farmacia not found.' }) 
        }

        const pacientes = farmacia.pacientes.map((paciente) => ({
            dni: paciente.user.dni,
            nombre: paciente.user.nombre,
            apellidos: paciente.user.apellidos,
            telefono: paciente.user.telefono,
            fecha_nacimiento: paciente.user.fecha_nacimiento,
            direccion: paciente.user.direccion,
            email: paciente.user.email,
            tutor: paciente.tutor ? {
                dni: paciente.tutor.user.dni,
                nombre: paciente.tutor.user.nombre,
                apellidos: paciente.tutor.user.apellidos,
                email: paciente.tutor.user.email
            } : null,
            tratamientos: paciente.tratamientos,
        })) 

        console.log("Pacientes encontrados:", pacientes)  

        return reply.status(200).send(pacientes) 

    } catch (error) {
        console.error("Error in getFarmaciaPacientesByID:", error.message) 
        console.error(error.stack) 
        return reply.status(500).send({ error: 'Error getting farmacia.' }) 
    }
}

const getFarmaciaTutoresByID = async (req, reply) => {
    try {
        const user = req.user
        const { id } = req.params

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) {
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can access this information.' })
        }

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            include: {
                tutores: {
                    include: {
                        user: {
                            select: {
                                dni: true,
                                email: true,
                                nombre: true,
                                apellidos: true,
                                createdAt: true,
                                telefono: true,
                                fecha_nacimiento: true,
                                direccion: true,
                                foto: true,
                                role: true
                            }
                        },
                        pacientes: {
                            include: {
                                user: {
                                    select: {
                                        dni: true,
                                        nombre: true,
                                        apellidos: true,
                                        email: true,
                                        telefono: true,
                                        fecha_nacimiento: true,
                                        direccion: true,
                                        foto: true,
                                        role: true
                                    }
                                },
                                tratamientos: true
                            }
                        }
                    }
                }
            }
        })

        if (!farmacia) {
            return reply.status(404).json({ error: 'Farmacia not found.' })
        }

        const tutores = farmacia.tutores.map((tutor) => ({
            dni: tutor.user.dni,
            nombre: tutor.user.nombre,
            apellidos: tutor.user.apellidos,
            telefono: tutor.user.telefono,
            fecha_nacimiento: tutor.user.fecha_nacimiento,
            direccion: tutor.user.direccion,
            email: tutor.user.email,
            foto: tutor.user.foto,
            role: tutor.user.role,
            pacientes: tutor.pacientes.map((paciente) => ({
                dni: paciente.user.dni,
                nombre: paciente.user.nombre,
                apellidos: paciente.user.apellidos,
                email: paciente.user.email,
                telefono: paciente.user.telefono,
                fecha_nacimiento: paciente.user.fecha_nacimiento,
                direccion: paciente.user.direccion,
                foto: paciente.user.foto,
                tratamientos: paciente.tratamientos
            }))
        }))

        console.log("Tutores encontrados:", tutores)

        return reply.status(200).send(tutores)

    } catch (error) {
        console.error("Error in getFarmaciaTutoresByID:", error.message)
        console.error(error.stack)
        return reply.status(500).send({ error: 'Error getting tutores from farmacia.' })
    }
}


const getFarmaciaPacientesSinTutorByID = async (req, reply) => {
    try {
        const user = req.user  
        const { id } = req.params  

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) 
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get this data.' })  
        

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            include: {
                pacientes: {
                    include: {
                        user: {
                            select: {
                                dni: true,
                                nombre: true,
                                apellidos: true
                            }
                        },
                        tutor: true
                    }
                }
            }
        })  

        if (!farmacia) 
            return reply.status(404).json({ error: 'Farmacia not found.' })  
        

        const pacientesSinTutor = farmacia.pacientes
            .filter(paciente => !paciente.tutor) 
            .map(paciente => ({
                dni: paciente.user.dni,
                nombre: paciente.user.nombre,
                apellidos: paciente.user.apellidos
            }))  

        return reply.status(200).send(pacientesSinTutor)  

    } catch (error) {
        console.error(error)  
        return reply.status(500).send({ error: 'Error getting pacientes without tutor.' })  
    }
}  

const updateFarmacia = async (req, reply) => {
    try {
        const user = req.user
        const { id } = req.params
        const { nombre, direccion } = req.body

        if (user.role !== ROLES.ADMIN)
            return reply.status(401).send({ error: "UNAUTHORIZED. Only ADMINS can update farmacias." })

        const existingFarmacia = await prisma.farmacia.findFirst({
            where: {
                AND: [
                    { id: { not: parseInt(id) } },
                    { OR: [{ nombre }, { direccion }] },
                ],
            },
        })

        if (existingFarmacia)
            return reply.status(400).send({ error: "A farmacia with this name or address already exists." })

        const farmacia = await prisma.farmacia.update({
            where: { id: parseInt(id) },
            data: { nombre, direccion },
        })

        return reply.status(200).send(farmacia)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: "Error updating farmacia." })
    }
}


const deleteFarmacia = async (req, reply) => {
    try {
        const user = req.user
        const { id } = req.params

        if (user.role !== ROLES.ADMIN)
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can delete farmacias.' })


        const farmaciaId = parseInt(id)

        const tratamientos = await prisma.tratamiento.findMany({
            where: { sanitario: { idFarmacia: farmaciaId } },
            select: { id: true },
        })
        const tratamientoIds = tratamientos.map((tratamiento) => tratamiento.id)

        await prisma.registroTratamiento.deleteMany({
            where: { idTratamiento: { in: tratamientoIds } },
        })

        await prisma.dosis.deleteMany({
            where: { tratamiento: { id: { in: tratamientoIds } } },
        })

        await prisma.tratamiento.deleteMany({
            where: { id: { in: tratamientoIds } },
        })

        await prisma.sanitario.deleteMany({
            where: { idFarmacia: farmaciaId },
        })

        await prisma.paciente.deleteMany({
            where: { idFarmacia: farmaciaId },
        })

        await prisma.farmacia.delete({
            where: { id: farmaciaId },
        })

        return reply.status(200).send({ message: 'Farmacia deleted.' })

    } catch (error) {
        console.error("Error deleting farmacia:", error)
        return reply.status(500).send({ error: 'Error deleting farmacia.' })
    }
}

const removePacienteFromFarmacia = async (req, reply) => {
    try {
        const user = req.user 
        const { idFarmacia, dniPaciente } = req.params

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) {
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can remove patients from farmacias.' })
        }

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(idFarmacia) }
        })

        if (!farmacia) 
            return reply.status(404).send({ error: 'Farmacia not found.' })
        

        const paciente = await prisma.paciente.findUnique({
            where: { idUser: dniPaciente },
            include: { tratamientos: true }
        })

        if (!paciente)
            return reply.status(404).send({ error: 'Paciente not found.' })
        

        if (paciente.idFarmacia !== parseInt(idFarmacia)) {
            return reply.status(400).send({ error: 'The patient is not assigned to this farmacia.' })
        }

        for (const tratamiento of paciente.tratamientos) {
            const simulatedReq = { params: { id: tratamiento.id }, user }
            await deleteTratamiento(simulatedReq, reply, true) 
        }

        await prisma.paciente.update({
            where: { idUser: dniPaciente },
            data: { idFarmacia: null }
        })

        return reply.status(200).send({ message: 'Patient and associated treatments removed from farmacia successfully.' })

    } catch (error) {
        console.error('Error removing patient from farmacia:', error)
        return reply.status(500).send({ error: 'Error removing patient from farmacia.' })
    }
}

export default {
    createFarmacia,
    getFarmacias,
    addPacienteToFarmacia,
    getFarmaciaByID,
    getFarmaciaByNombre,
    getFarmaciaSanitariosByID,
    getFarmaciaPacientesByID,
    getFarmaciaTutoresByID,
    getFarmaciaPacientesSinTutorByID,
    updateFarmacia,
    deleteFarmacia,
    removePacienteFromFarmacia
}