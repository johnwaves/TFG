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

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO)
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' })

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            include: {
                sanitarios: true,
                pacientes: true
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

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) 
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' })

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            select: {
                sanitarios: {
                    include: {
                        user: {
                            select: {
                                dni: true,
                                nombre: true,
                                apellidos: true
                            }
                        }
                    }
                }
            }
        })

        if (!farmacia) {
            return reply.status(404).send({ error: 'Farmacia not found.' })
        }

        const sanitarios = farmacia.sanitarios.map(sanitario => ({
            dni: sanitario.user.dni,
            nombre: sanitario.user.nombre,
            apellidos: sanitario.user.apellidos,
            tipo: sanitario.tipo 
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

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO)
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' })

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
                        }
                    }
                }
            }
        })

        if (!farmacia)
            return reply.status(404).json({ error: 'Farmacia not found.' })

        const pacientes = farmacia.pacientes.map(paciente => ({
            dni: paciente.user.dni,
            nombre: paciente.user.nombre,
            apellidos: paciente.user.apellidos
        }))

        // console.log("Pacientes en la respuesta:", pacientes) 
        return reply.status(200).send(pacientes)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error getting farmacia.' })
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
    getFarmaciaPacientesSinTutorByID,
    updateFarmacia,
    deleteFarmacia,
    removePacienteFromFarmacia
}