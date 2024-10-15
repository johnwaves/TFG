import prisma from '../config/prisma.js'
import { hashPassword } from '../utils/pass.js';
import { createUserPermissions, ROLES, TIPO_SANITARIO, checkPermissions } from '../utils/roles.js';


// CRUD operations for users
const createUser = async (req, res) => {
    try {
        const { dni, email, password, nombre, apellidos, fechaNac, telefono, direccion, role, tipoSanitario, idFarmacia, foto, idPaciente } = req.body
        const userCreator = req.user;

        const existingUser = await prisma.user.findUnique({
            where: {
                dni
            }
        })

        if (existingUser) return res.status(400).send({ error: 'Ya existe un usuario con este DNI.' })

        let allowedRoles = []

        if (userCreator.role === ROLES.ADMIN)
            allowedRoles = createUserPermissions[ROLES.ADMIN]
        else if (userCreator.role === ROLES.SANITARIO)
            allowedRoles = createUserPermissions[userCreator.sanitario.tipo] || []
        else
            return res.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can create users.' })

        if (!allowedRoles.includes(role)) 
            return res.status(403).send({ error: 'UNAUTHORIZED. You are not allowed to create a user with this role.' })

        if (role === ROLES.SANITARIO && !tipoSanitario)
            return res.status(400).send({ error: 'El tipo de sanitario es requerido.' })

        if (role === ROLES.SANITARIO && !Object.values(TIPO_SANITARIO).includes(tipoSanitario))
            return res.status(400).send({ error: 'El tipo de sanitario no es válido.' })

        if (idFarmacia){
            const farmacia = await prisma.farmacia.findUnique({
                where: {
                    id: idFarmacia
                }
            })
            if (!farmacia) return res.status(400).send({ error: 'La farmacia no existe.' })
        }

        if (role === ROLES.TUTOR){
            if (!idPaciente)
                return res.status(400).send({ error: 'El paciente no existe.' })
            
            const existingPatient = await prisma.paciente.findUnique({
                where: {
                    id: idPaciente
                }
            })
            if (!existingPatient) return res.status(400).send({ error: 'El paciente no existe.' })
        }

        const hashedPassword = await hashPassword(password)

        const newUser = await prisma.user.create({
            data: {
                dni,
                email,
                password: hashedPassword,
                nombre,
                apellidos,
                fecha_nacimiento: fechaNac,
                telefono,
                direccion,
                foto,
                role,
                sanitrario: role === ROLES.SANITARIO ? {
                    create: {
                        tipo: tipoSanitario,
                        idFarmacia
                    }
                } : undefined,
                tutor : role === ROLES.TUTOR ? {
                    create: {
                        pacientes: { connect: { idUser: idPaciente}}
                    }
                } : undefined,
                paciente : role === ROLES.PACIENTE ? {
                    create: {
                        idFarmacia
                    }
                } : undefined
            }
        })

        if (role === ROLES.TUTOR){
            await prisma.paciente.update({
                where: { idUser: idPaciente },
                data: {idTutor: newUser.tutor.idUser }
            })
        }

        return res.status(201).send({ message: 'User created successfully.', user: newUser })

    } catch (error) {
        console.error(error)
        res.code(500).send({ error: 'Error creating user.'})

    }
}

const getUserByDNI = async (req, res) => {
    try {
        const { dni } = req.params
        const user = await prisma.user.findUnique({
            where: {
                dni
            }
        })
        if (!user) return res.status(404).send({ error: 'User not found.' })
        return res.status(200).send(user)

    } catch (error) {
        console.error(error)
        res.code(500).send({ error: 'Error getting user.'})
    }
}

const getAllUsers = async (res) => {
    try {
        const users = await prisma.user.findMany()

        if (!users) return res.status(404).send({ error: 'No users found.' })
        return res.status(200).send(users)

    } catch (error) {
        console.error(error)
        res.code(500).send({ error: 'Error getting users.'})
    }
}

const getSanitarioData = async (req, res) => {
    try {
        const user = await getUserByDNI(req.params.dni)
        if (!user) return res.status(404).send({ error: 'User not found.' })

        if (user.role !== ROLES.SANITARIO) return res.status(400).send({ error: 'El usuario no es un sanitario.' })

        const sanitario =  await prisma.sanitario.findUnique({
            where: {
                idUser: user.id
            },
            include: {
                tipo: true,
                idFarmacia: true,
                tratamientos: true
            }
        })

        return res.status(200).send(sanitario)

    } catch {
        console.error(error)
        res.code(500).send({ error: 'Error getting sanitario data.'})

    }
    
}

const getPacienteData = async (req, res) => {
    try {
        const user = await getUserByDNI(req.params.dni)
        if (!user) return res.status(404).send({ error: 'User not found.' })

        if (user.role !== ROLES.PACIENTE) return res.status(400).send({ error: 'El usuario no es un paciente.' })

        const paciente =  await prisma.paciente.findUnique({
            where: {
                idUser: user.id
            },
            include: {
                idFarmacia: true,
                tutor: true,
                idTutor: true,
                tratamientos: true,

            }
        })

        return res.status(200).send(paciente)

    } catch {
        console.error(error)
        res.code(500).send({ error: 'Error getting paciente data.'})
    }

}

const getTutorData = async (req, res) => {
    try {
        const user = await getUserByDNI(req.params.dni)
        if (!user) return res.status(404).send({ error: 'User not found.' })

        if (user.role !== ROLES.TUTOR) return res.status(400).send({ error: 'El usuario no es un tutor.' })

        const tutor =  await prisma.tutor.findUnique({
            where: {
                idUser: user.id
            },
            include: {
                pacientes: true
            }
        })

        return res.status(200).send(tutor)

    } catch {
        console.error(error)
        res.code(500).send({ error: 'Error getting tutor data.'})
    }

}

const updateUser = async (req, res) => {
    try {
        const { dni } = req.params
        const dataToUpdate = req.body
        const userModifier = req.user

        const userToUpdate = await prisma.user.findUnique({
            where: {
                dni
            }
        })

        if (!userToUpdate) return res.status(404).send({ error: 'User not found.' })

        const allowedToUpdate = checkPermissions(userModifier, userToUpdate)

        if (!allowedToUpdate) return res.status(403).send({ error: 'You do not have permission to update this user.' })

        const allowedFields = ['email', 'nombre', 'apellidos', 'telefono', 'fecha_nacimiento', 'direccion', 'foto']
        const filteredData = {}

        for (const key of allowedFields){
            if (dataToUpdate[key] !== undefined)
                filteredData[key] = dataToUpdate[key]
            
        }

        // Validación adicional para el tipo de sanitario
        if (dataToUpdate.role === ROLES.SANITARIO && dataToUpdate.tipoSanitario){
            if (!Object.values(TIPO_SANITARIO).includes(dataToUpdate.tipoSanitario))
                return res.status(400).send({ error: 'El tipo de sanitario no es válido.' })
        }

        const updatedUser = await prisma.user.update({
            where: { dni },
            data: filteredData
        })

        return res.status(200).send({ message: 'User updated successfully.', user: updatedUser })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'An error occurred while updating the user.' })
    }
    
}

const deleteUser = async (req, res) => {
    try {
        const { dni } = req.params
        const userModifier = req.user

        const userToDelete = await prisma.user.findUnique({
            where: {
                dni
            }
        })

        if (!userToDelete) return res.status(404).send({ error: 'User not found.' })

        const allowedToDelete = checkPermissions(userModifier, userToDelete)

        if (!allowedToDelete) return res.status(403).send({ error: 'You do not have permission to delete this user.' })

        await prisma.user.delete({
            where: { dni }
        })

        return res.status(200).send({ message: 'User deleted successfully.' })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'An error occurred while deleting the user.' })
    }
}

module.exports = { 
    createUser,
    getUserByDNI,
    getAllUsers,
    getSanitarioData,
    getPacienteData,
    getTutorData,
    updateUser,
    deleteUser

}

