import prisma from '../config/prisma.js'
import { ROLES, checkPermissions } from '../utils/roles.js'

const createFarmacia = async (req, reply) => {
    try{
        const user = req.user
        const { nombre, direccion } = req.body

        if (user.role !== ROLES.ADMIN) 
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can create farmacias.' })
        
        const existingFarmacia = await prisma.farmacia.findUnique({ where: { nombre }})
        if (existingFarmacia) 
            return reply.status(400).send({ error: 'Farmacia already exists.' })

        const farmacia = await prisma.farmacia.create({
            data: { nombre, direccion }
        })

        return reply.status(201).send(farmacia)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error creating farmacia.' })
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
        const { nombre } = req.params

        const farmacia = await prisma.farmacia.findUnique({
            where: { nombre },
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
        const { id } = req.params;

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            select: {
                sanitarios: true
            }
        })

        if (!farmacia) {
            return reply.status(404).send({ error: 'Farmacia not found.' })
        }

        return reply.status(200).send(farmacia.sanitarios || [])

    } catch (error) {
        console.error(error);
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
                pacientes: true
            }
        })

        if (!farmacia)
            return reply.status(404).json({ error: 'Farmacia not found.' })

        return reply.status(200).send(farmacia.pacientes)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error getting farmacia.' })
    }
}

const updateFarmacia = async (req, reply) => {
    try {
        const user = req.user
        const { id } = req.params
        const { nombre, direccion } = req.body

        if (user.role !== ROLES.ADMIN)
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can update farmacias.' })

        const farmacia = await prisma.farmacia.update({
            where: { id: parseInt(id) },
            data: { nombre, direccion }
        })

        return reply.status(200).send(farmacia)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error updating farmacia.' })
    }
}

const deleteFarmacia = async (req, reply) => {
    try {
        const user = req.user;
        const { id } = req.params;

        if (user.role !== ROLES.ADMIN) {
            return reply.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can delete farmacias.' })
        }

        await prisma.paciente.deleteMany({
            where: { idFarmacia: parseInt(id) },
        })

        await prisma.tutor.deleteMany({
            where: { pacientes: { some: { idFarmacia: parseInt(id) } } },
        })

        await prisma.sanitario.deleteMany({
            where: { idFarmacia: parseInt(id) },
        })

        await prisma.farmacia.delete({
            where: { id: parseInt(id) },
        })

        return reply.status(200).send({ message: 'Farmacia deleted.' })

    } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: 'Error deleting farmacia.' })
    }
}

export default {
    createFarmacia,
    getFarmaciaByID,
    getFarmaciaByNombre,
    getFarmaciaSanitariosByID,
    getFarmaciaPacientesByID,
    updateFarmacia,
    deleteFarmacia
}