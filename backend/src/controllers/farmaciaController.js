import prisma from '../config/prisma.js'
import { ROLES, checkPermissions } from '../utils/roles.js'

const createFarmacia = async (req, res) => {
    try{
        const user = req.user
        const { nombre, direccion } = req.body

        if (user.role !== ROLES.ADMIN) 
            return res.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can create farmacias.' })
        
        const existingFarmacia = await prisma.farmacia.findUnique({ where: { nombre }})
        if (existingFarmacia) 
            return res.status(400).send({ error: 'Farmacia already exists.' })

        const farmacia = await prisma.farmacia.create({
            data: { nombre, direccion }
        })

        return res.status(201).send(farmacia)

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error creating farmacia.' })
    }
}

const getFarmaciaByID = async (req, res) => {
    try {
        const { id } = req.params
        const user = req.user

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) 
            return res.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' })

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            include: {
                sanitarios: true,
                pacientes: true
            }

        })

        if (!farmacia) 
            return res.status(404).send({ error: 'Farmacia not found.' })

        return res.status(200).send(farmacia)

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error getting farmacia.' })
    }
}

const getFarmaciaByNombre = async (req, res) => {
    try {
        const { nombre } = req.params

        const farmacia = await prisma.farmacia.findUnique({
            where: { nombre },
            include: {
                sanitarios: true
            }
        })

        if (!farmacia) 
            return res.status(404).send({ error: 'Farmacia not found.' })

        return res.status(200).send(farmacia)

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error getting farmacia.' })
    }

}

const getFarmaciaSanitariosByID = async (req, res) => {
    try {
        const { id } = req.params

        const sanitarios = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            select: {
                sanitarios: true
            }
        })

        if (!sanitarios) 
            return res.status(404).send({ error: 'Farmacia not found.' })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error fetching sanitarios.' })

    }

}

const getFarmaciaPacientesByID = async (req, res) => {
    try {
        const user = req.user
        const { id } = req.params

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO)
            return res.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS and SANITARIOS can get farmacias.' })

        const farmacia = await prisma.farmacia.findUnique({
            where: { id: parseInt(id) },
            include: {
                pacientes: true
            }
        })

        if (!farmacia)
            return res.status(404).json({ error: 'Farmacia not found.' })

        return res.status(200).send(farmacia.pacientes)

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error getting farmacia.' })
    }
}

const updateFarmacia = async (req, res) => {
    try {
        const user = req.user
        const { id } = req.params
        const { nombre, direccion } = req.body

        if (user.role !== ROLES.ADMIN)
            return res.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can update farmacias.' })

        const farmacia = await prisma.farmacia.update({
            where: { id: parseInt(id) },
            data: { nombre, direccion }
        })

        return res.status(200).send(farmacia)

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error updating farmacia.' })
    }
}

const deleteFarmacia = async (req, res) => {
    try {
        const user = req.user
        const { id } = req.params

        if (user.role !== ROLES.ADMIN)
            return res.status(401).send({ error: 'UNAUTHORIZED. Only ADMINS can delete farmacias.' })

        await prisma.farmacia.delete({
            where: { id: parseInt(id) }
        })

        return res.status(200).send({ message: 'Farmacia deleted.' })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error deleting farmacia.' })
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