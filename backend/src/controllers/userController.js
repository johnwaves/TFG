import prisma from '../config/prisma.js'
import { hashPassword, comparePassword } from '../utils/pass.js'
import { createUserPermissions, ROLES, TIPO_SANITARIO, checkPermissions } from '../utils/roles.js'


// CRUD operations for users
const createUser = async (req, reply) => {
    try {
        const { dni, email, password, nombre, apellidos, fechaNac, telefono, direccion, role, tipoSanitario, idFarmacia, foto, dniPaciente } = req.body
        const userCreator = req.user

        const existingUser = await prisma.user.findUnique({
            where: { dni }
        })

        const fechaNacimiento = new Date(fechaNac)
        if (isNaN(fechaNacimiento.getTime())) {
            return reply.status(400).send({ error: 'Fecha de nacimiento no es válida.' })
        }

        if (existingUser) return reply.status(400).send({ error: 'Ya existe un usuario con este DNI.' })

        let allowedRoles = []

        if (userCreator.role === ROLES.ADMIN) {
            allowedRoles = createUserPermissions[ROLES.ADMIN]
        } else if (userCreator.role === ROLES.SANITARIO) {
            if (!userCreator.sanitario) {
                userCreator.sanitario = await prisma.sanitario.findUnique({
                    where: { idUser: userCreator.dni }
                })

                if (!userCreator.sanitario) 
                    return reply.status(400).send({ error: 'El usuario sanitario no tiene información de tipo de sanitario.' })
                
            }
            allowedRoles = createUserPermissions[userCreator.sanitario.tipo] || []
            
        } else {
            return reply.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can create users.' })
        }

        if (!allowedRoles.includes(role)) {
            return reply.status(403).send({ error: 'UNAUTHORIZED. You are not allowed to create a user with this role.' })
        }

        if (role === ROLES.SANITARIO && !tipoSanitario) {
            return reply.status(400).send({ error: 'El tipo de sanitario es requerido.' })
        }

        if (role === ROLES.SANITARIO && !Object.values(TIPO_SANITARIO).includes(tipoSanitario)) {
            return reply.status(400).send({ error: 'El tipo de sanitario no es válido.' })
        }

        if (role === ROLES.SANITARIO && !idFarmacia) {
            return reply.status(400).send({ error: 'El id de la farmacia es requerido para sanitarios.' })
        }

        if (idFarmacia) {
            const farmacia = await prisma.farmacia.findUnique({
                where: { id: idFarmacia }
            }) 
            if (!farmacia) return reply.status(400).send({ error: 'La farmacia no existe.' })
        }

        if (role === ROLES.TUTOR) {
            if (!dniPaciente) {
                return reply.status(400).send({ error: 'El DNI del paciente es requerido.' })
            }

            const existingPatient = await prisma.paciente.findUnique({
                where: { idUser: dniPaciente }
            })
            if (!existingPatient) return reply.status(400).send({ error: 'El paciente no existe.' })
        }

        const hashedPassword = await hashPassword(password)

        const newUser = await prisma.user.create({
            data: {
                dni,
                email,
                password: hashedPassword,
                nombre,
                apellidos,
                fecha_nacimiento: fechaNacimiento,
                telefono,
                direccion,
                foto,
                role,
                sanitario: role === ROLES.SANITARIO ? {
                    create: {
                        tipo: tipoSanitario,
                        idFarmacia
                    }
                } : undefined,
                tutor: role === ROLES.TUTOR ? {
                    create: {
                        pacientes: { connect: { idUser: dniPaciente } } 
                    }
                } : undefined,
                paciente: role === ROLES.PACIENTE ? {
                    create: {
                        idFarmacia
                    }
                } : undefined
            }
        })

        if (role === ROLES.TUTOR) {
            await prisma.paciente.update({
                where: { idUser: dniPaciente }, 
                data: { idTutor: newUser.dni } 
            })
        }

        return reply.status(201).send({ message: 'User created successfully.', user: newUser })

    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Error creating user.' })
    }
}


const getUserByDNI = async (req, reply) => {
    try {
        const { dni } = req.params
        const user = await prisma.user.findUnique({
            where: {
                dni
            }
        })
        if (!user) return reply.status(404).send({ error: 'User not found.' })
        return reply.status(200).send(user)

    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Error getting user.'})
    }
}

const getAllUsers = async (req, reply) => {
    try {
        const users = await prisma.user.findMany()

        if (!users) return reply.status(404).send({ error: 'No users found.' })
        
        return reply.status(200).send(users)

    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Error getting users.'})
    }
}

const getSanitarioData = async (req, reply) => {
    try {
        const { dni } = req.params
        const user = await prisma.user.findUnique({
            where: {
                dni
            },
            include: {
                sanitario: true
            }
        })
        if (!user) return reply.status(404).send({ error: 'User not found.' })

        if (user.role !== ROLES.SANITARIO) return reply.status(400).send({ error: 'El usuario no es un sanitario.' })

        const sanitario =  await prisma.sanitario.findUnique({
            where: {
                idUser: user.dni
            },
            include: {
                farmacia: true,
                tratamientos: true
            }
        })

        if (!sanitario) return reply.status(404).send({ error: 'Sanitario not found.' })

        const response = {
            ...sanitario,
            tipo: user.sanitario.tipo
        }

        return reply.status(200).send(response)

    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Error getting sanitario data.'})

    }
    
}

const getPacienteData = async (req, reply) => {
    try {
        const { dni } = req.params
        const user = await prisma.user.findUnique({
            where: {
                dni
            },
            include: {
                paciente: true
            }
        })
        if (!user) return reply.status(404).send({ error: 'User not found.' })

        if (user.role !== ROLES.PACIENTE) return reply.status(400).send({ error: 'El usuario no es un paciente.' })

        const paciente =  await prisma.paciente.findUnique({
            where: {
                idUser: user.dni
            },
            include: {
                farmacia: true,
                tutor: {
                    include: {
                        user: true
                    }
                },
                tratamientos: true
            }
        })

        if (!paciente) return reply.status(404).send({ error: 'Paciente not found.' })

        const response = {
            idFarmacia: paciente.farmacia?.id,
            tutor: paciente.tutor ? {
                dni: paciente.tutor.idUser,
                nombre: paciente.tutor.user?.nombre,
                apellidos: paciente.tutor.user?.apellidos
            } : null,
            tratamientos: paciente.tratamientos
        }

        return reply.status(200).send(response)

    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Error getting paciente data.'})
    }
}

const getTutorData = async (req, reply) => {
    try {
        const { dni } = req.params
        const user = await prisma.user.findUnique({
            where: {
                dni
            },
            include: {
                tutor: true
            }
        })
        if (!user) return reply.status(404).send({ error: 'User not found.' })

        if (user.role !== ROLES.TUTOR) return reply.status(400).send({ error: 'El usuario no es un tutor.' })

        const tutor = await prisma.tutor.findUnique({
            where: {
                idUser: user.dni
            },
            include: {
                pacientes: {
                    include: {
                        user: true
                    }
                }
            }
        })

        if (!tutor) return reply.status(404).send({ error: 'Tutor not found.' })

        const response = {
            idUser: tutor.idUser,
            pacientes: tutor.pacientes.map(p => ({
                dni: p.user.dni,
                nombre: p.user.nombre,
                apellidos: p.user.apellidos
            }))
        }

        return reply.status(200).send(response)

    } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Error getting tutor data.' })
    }
}

const updateUser = async (req, reply) => {
    try {
        const { dni } = req.params 
        const dataToUpdate = req.body 
        let userModifier = req.user 

        if (userModifier.role === ROLES.SANITARIO) {
            const completeUserModifier = await prisma.user.findUnique({
                where: { dni: userModifier.dni },
                include: { sanitario: true },
            }) 

            if (!completeUserModifier) {
                return reply.status(404).send({ error: 'User not found.' }) 
            }

            userModifier = {
                ...userModifier,
                sanitario: completeUserModifier.sanitario,
            } 
        }

        const userToUpdate = await prisma.user.findUnique({
            where: { dni },
        }) 

        if (!userToUpdate) return reply.status(404).send({ error: 'User not found.' }) 

        const allowedToUpdate = checkPermissions(userModifier, userToUpdate) 

        if (!allowedToUpdate) return reply.status(403).send({ error: 'You do not have permission to update this user.' }) 

        const allowedFields = ['email', 'nombre', 'apellidos', 'telefono', 'fecha_nacimiento', 'direccion', 'foto'] 
        const filteredData = {} 

        for (const key of allowedFields) {
            if (
                dataToUpdate[key] !== undefined && dataToUpdate[key] !== userToUpdate[key] 
            ) {
                filteredData[key] = key === 'fecha_nacimiento'
                    ? new Date(dataToUpdate[key]) 
                    : dataToUpdate[key] 
            }
        }

        // Si no hay cambios, no se modifican los datos
        if (Object.keys(filteredData).length === 0) {
            return reply.status(200).send({ message: 'No changes detected. User data is already up to date.' }) 
        }

        // Campos que cambian
        const updatedUser = await prisma.user.update({
            where: { dni },
            data: filteredData,
        }) 

        return reply.status(200).send({ message: 'User updated successfully.', user: updatedUser }) 

    } catch (error) {
        console.error("Error in updateUser:", error.message) 
        console.error("Stack trace:", error.stack) 
        return reply.status(500).send({ error: 'An error occurred while updating the user.' }) 
    }
} 

const deleteUser = async (req, reply) => {
    try {
        const { dni } = req.params
        const userModifier = req.user

        const userToDelete = await prisma.user.findUnique({
            where: { dni },
            include: {
                paciente: true,
                sanitario: true,
                tutor: true
            }
        })

        if (!userToDelete) {
            return reply.status(404).send({ error: 'User not found.' })
        }

        const allowedToDelete = checkPermissions(userModifier, userToDelete)
        if (!allowedToDelete) {
            return reply.status(403).send({ error: 'You do not have permission to delete this user.' })
        }

        if (userToDelete.paciente) {
            await prisma.paciente.delete({
                where: { idUser: dni }
            })
        }

        if (userToDelete.sanitario) {
            await prisma.sanitario.delete({
                where: { idUser: dni }
            })
        }

        if (userToDelete.tutor) {
            await prisma.tutor.delete({
                where: { idUser: dni }
            })
        }

        await prisma.user.delete({
            where: { dni }
        })

        return reply.status(200).send({ message: 'User deleted successfully.' })

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'An error occurred while deleting the user.' })
    }
}

const getPacientesSinFarmacia = async (req, reply) => {
    try {
        const pacientesSinFarmacia = await prisma.paciente.findMany({
            where: {
                idFarmacia: null
            },
            include: {
                user: {
                    select: {
                        dni: true,
                        nombre: true,
                        apellidos: true,
                    }
                }
            }
        }) 

        return reply.status(200).send(pacientesSinFarmacia) 

    } catch (error) {
        console.error(error) 
        reply.status(500).send({ error: 'Error retrieving patients without assigned pharmacy.' }) 
    }
} 

const updatePassword = async (req, reply) => {
    try {
        const { dni } = req.params 
        const { newPassword, role } = req.body 
        const userModifier = req.user

        if (![ROLES.ADMIN, ROLES.SANITARIO].includes(userModifier.role)) {
            return reply.status(403).send({ error: 'UNAUTHORIZED. Only ADMIN or SANITARIO can update passwords.' })
        }

        const userToUpdate = await prisma.user.findUnique({
            where: { dni }
        })

        if (!userToUpdate) return reply.status(404).send({ error: 'User not found.' })
        
        if (!newPassword || newPassword.length < 6) {
            return reply.status(400).send({ error: 'New password is invalid or too short (minimum 6 characters).' })
        }
            
        const hashedPassword = await hashPassword(newPassword)

        await prisma.user.update({
            where: { dni },
            data: { password: hashedPassword }
        })

        return reply.status(200).send({ message: 'Password updated successfully.' })

    } catch (error) {
        console.error("Error in updatePassword:", error.message)
        reply.status(500).send({ error: 'Error updating password.' })
    }
}

export default { 
    createUser,
    getUserByDNI,
    getAllUsers,
    getSanitarioData,
    getPacienteData,
    getTutorData,
    updateUser,
    deleteUser,
    getPacientesSinFarmacia,
    updatePassword
}

