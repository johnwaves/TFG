import prisma from '../config/prisma.js'
import { ROLES, TIPO_SANITARIO } from '../utils/roles.js'

// CRUD operations for tratamientos

const createTratamiento = async (req, reply) => {
    try {
        const { nombre, descripcion, tipo, idPaciente, dosis, fecha_fin } = req.body
        let user = req.user

        if (!user) return reply.status(401).send({ error: 'UNAUTHORIZED. You must be logged in to create treatments.' })

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) {
            return reply.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can create treatments.' })
        }

        if (!user.sanitario || !user.sanitario.tipo) {
            const fullUser = await prisma.user.findUnique({
                where: { dni: user.dni },
                include: { sanitario: true }
            })
            user = { ...user, ...fullUser }
        }

        if (!user.sanitario || ![TIPO_SANITARIO.FARMACEUTICO, TIPO_SANITARIO.TECNICO].includes(user.sanitario.tipo))
            return reply.status(403).send({ error: 'UNAUTHORIZED. Only a FARMACEUTICO or TECNICO can create treatments.' })

        const paciente = await prisma.paciente.findUnique({
            where: { idUser: idPaciente }
        })
        if (!paciente) return reply.status(400).send({ error: 'El paciente no existe.' })

        const sameFarmacia = await verifySameFarmacia(user.sanitario.idUser, paciente.idUser, paciente.idTutor)
        if (!sameFarmacia)
            return reply.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })

        if (tipo === 'FARMACOLOGICO') {
            if (!dosis) return reply.status(400).send({ error: 'La dosis es requerida.' })
            const newDosis = await prisma.dosis.create({
                data: { cantidad: dosis.cantidad, intervalo: dosis.intervalo, duracion: dosis.duracion }
            })

            const tratamiento = await prisma.tratamiento.create({
                data: {
                    nombre, descripcion, tipo, idSanitario: user.sanitario.idUser, idPaciente, idDosis: newDosis.id
                }
            })

            return reply.status(201).send(tratamiento)
        }

        if (tipo === 'NO_FARMACOLOGICO') {
            const tratamiento = await prisma.tratamiento.create({
                data: {
                    nombre, descripcion, tipo, idSanitario: user.sanitario.idUser, idPaciente, fecha_inicio: new Date(), fecha_fin: new Date(fecha_fin)
                }
            })

            return reply.status(201).send(tratamiento)
        }

        return reply.status(400).send({ error: 'El tipo de tratamiento no es válido.' })
    } catch (error) {
        console.error("Error al crear tratamiento:", error)
        return reply.status(500).send({ error: 'Error creating tratamiento.' })
    }
}

const updateTratamiento = async (req, reply) => {
    try {
        const { nombre, descripcion, dosis, fecha_fin, tipo } = req.body
        const tratamientoId = parseInt(req.params.id)
        let user = req.user

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO) {
            return reply.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can update treatments.' })
        }

        if (!user.sanitario || !user.sanitario.tipo) {
            const fullUser = await prisma.user.findUnique({
                where: { dni: user.dni },
                include: { sanitario: true }
            })
            user = { ...user, ...fullUser }
        }

        const tratamiento = await prisma.tratamiento.findUnique({
            where: { id: tratamientoId },
            include: { dosis: true, paciente: true }
        })
        if (!tratamiento) {
            return reply.status(404).send({ error: 'Treatment not found.' })
        }

        const isNombreOrDescripcionModified =
            (nombre && nombre !== tratamiento.nombre) ||
            (descripcion && descripcion !== tratamiento.descripcion)

        if (isNombreOrDescripcionModified && !(user.role === ROLES.ADMIN || user.sanitario.tipo === TIPO_SANITARIO.FARMACEUTICO))
            return reply.status(403).send({ error: 'UNAUTHORIZED. Only ADMIN or FARMACÉUTICO can modify name or description of treatments.' })


        const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.paciente.idUser)
        if (!sameFarmacia) {
            return reply.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })
        }

        if (user.sanitario.tipo === TIPO_SANITARIO.TECNICO && dosis) {
            return reply.status(403).send({ error: 'UNAUTHORIZED. A TECHNICIAN cannot modify treatment dosages.' })
        }

        if (tipo === 'FARMACOLOGICO' && dosis && tratamiento.dosis) {
            const updatedDosis = await prisma.dosis.update({
                where: { id: tratamiento.dosis.id },
                data: {
                    cantidad: dosis.cantidad,
                    intervalo: dosis.intervalo,
                    duracion: dosis.duracion
                }
            })
            return reply.status(200).send(updatedDosis)
        }

        if (tipo === 'NO_FARMACOLOGICO' && fecha_fin) {
            const updatedTratamiento = await prisma.tratamiento.update({
                where: { id: tratamientoId },
                data: { fecha_fin: new Date(fecha_fin) }
            })
            return reply.status(200).send(updatedTratamiento)
        }

        return reply.status(400).send({ error: 'Invalid treatment type or missing data.' })
    } catch (error) {
        console.error('Error updating tratamiento:', error)
        return reply.status(500).send({ error: 'Error updating treatment.' })
    }
}

const fetchLastRegistro = async (idTratamiento) => {
    return await prisma.registroTratamiento.findFirst({
        where: { idTratamiento: idTratamiento },
        orderBy: { fecha_registro: 'desc' },
        include: {
            tratamiento: true
        }
    })
}

const checkLastRegistro = async (req, reply) => {
    try {
        const idTratamiento = parseInt(req.params.id)
        const user = req.user

        if (isNaN(idTratamiento)) {
            return reply.status(400).send({ error: 'Invalid treatment ID provided.' })
        }

        const tratamiento = await prisma.tratamiento.findUnique({
            where: { id: idTratamiento },
            include: { paciente: true, sanitario: true }
        })

        if (!tratamiento) {
            return reply.status(404).send({ error: 'Treatment not found.' })
        }

        if (user.role === ROLES.PACIENTE && user.dni !== tratamiento.paciente.idUser) {
            return reply.status(403).send({ error: 'UNAUTHORIZED. Only the patient can access this treatment record.' })
        }

        const lastRegistro = await prisma.registroTratamiento.findFirst({
            where: { idTratamiento: idTratamiento },
            orderBy: { fecha_registro: 'desc' }
        })

        if (!lastRegistro) {
            return reply.status(200).send({ message: 'No records found for this treatment.' })
        }

        return reply.status(200).send({ lastRegistroDate: lastRegistro.fecha_registro })
    } catch (error) {
        console.error("Error fetching last registro:", error)
        return reply.status(500).send({ error: 'Error fetching the last registro for the treatment.' })
    }
}

const registroTratamiento = async (req, reply) => {
    try {
        const idTratamiento = parseInt(req.headers.idtratamiento)
        if (isNaN(idTratamiento)) {
            return reply.status(400).send({ error: 'Invalid treatment ID provided.' })
        }

        const { cumplimiento, detalles, fecha_registro } = req.body
        const user = req.user

        const tratamiento = await prisma.tratamiento.findUnique({
            where: { id: idTratamiento },
            include: {
                paciente: true,
                dosis: true,
                sanitario: {
                    include: { farmacia: true }
                }
            }
        })

        if (!tratamiento) {
            return reply.status(400).send({ error: 'No se ha encontrado el tratamiento.' })
        }

        if (user.role === ROLES.SANITARIO) {
            if (!tratamiento.paciente || !tratamiento.paciente.idFarmacia) {
                return reply.status(400).send({ error: 'El paciente no tiene farmacia asociada.' })
            }

            if (tratamiento.sanitario?.farmacia?.id !== tratamiento.paciente.idFarmacia) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. You can only add treatments for patients from your own pharmacy.' })
            }
        }

        if (tratamiento.tipo === 'FARMACOLOGICO') {
            const lastRegistro = await prisma.registroTratamiento.findFirst({
                where: { idTratamiento },
                orderBy: { fecha_registro: 'desc' }
            })

            if (!lastRegistro) {
                const fechaInicio = new Date(fecha_registro)
                const fechaFin = new Date(fechaInicio)
                if (tratamiento.dosis && tratamiento.dosis.duracion) {
                    fechaFin.setDate(fechaFin.getDate() + tratamiento.dosis.duracion)
                }

                await prisma.tratamiento.update({
                    where: { id: idTratamiento },
                    data: {
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin
                    }
                })
            }

            if (lastRegistro) {
                const lastRegistroTime = new Date(lastRegistro.fecha_registro)
                const nextAllowedTime = new Date(lastRegistroTime)

                if (tratamiento.dosis && tratamiento.dosis.intervalo) {
                    nextAllowedTime.setHours(nextAllowedTime.getHours() + tratamiento.dosis.intervalo)
                } else {
                    return reply.status(400).send({ error: 'No se ha encontrado el intervalo de dosis para el tratamiento.' })
                }

                if (new Date(fecha_registro) < nextAllowedTime) {
                    return reply.status(400).send({ error: `Se podrá añadir un nuevo registro después del intervalo de ${tratamiento.dosis.intervalo} horas.` })
                }
            }
        }

        if (tratamiento.tipo === 'NO_FARMACOLOGICO') {
            const lastRegistro = await fetchLastRegistro(idTratamiento)

            if (lastRegistro) {
                const lastRegistroDate = new Date(lastRegistro.fecha_registro)
                const registroDate = new Date(fecha_registro)
                if (registroDate.toDateString() === lastRegistroDate.toDateString()) {
                    return reply.status(400).send({ error: 'Sólo se puede añadir un registro al día para este tipo de tratamiento.' })
                }
            }
        }

        const registro = await prisma.registroTratamiento.create({
            data: {
                idTratamiento,
                cumplimiento,
                detalles: detalles || '',
                fecha_registro: new Date(fecha_registro)
            }
        })

        return reply.status(201).send(registro)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error registering treatment compliance.' })
    }
}



const getAllTratamientosByDNI = async (req, reply) => {
    try {
        const { dniSolicitante, dniSolicitado } = req.body

        console.log("dniSolicitante:", dniSolicitante, "dniSolicitado:", dniSolicitado)

        if (!dniSolicitante || !dniSolicitado) {
            return reply.status(400).send({ error: 'Both dniSolicitante and dniSolicitado are required.' })
        }

        const solicitante = await prisma.user.findUnique({
            where: { dni: dniSolicitante },
            include: {
                sanitario: true,
                tutor: true,
                paciente: true
            }
        })

        if (!solicitante) {
            return reply.status(404).send({ error: 'Solicitante not found.' })
        }

        let tratamientos = []

        if (dniSolicitante === dniSolicitado && solicitante.role === 'PACIENTE') {
            tratamientos = await prisma.tratamiento.findMany({
                where: {
                    idPaciente: dniSolicitado
                },
                include: {
                    dosis: true,
                    registro: true,
                    sanitario: {
                        include: {
                            user: {
                                select: {
                                    dni: true,
                                    nombre: true,
                                    apellidos: true
                                }
                            }
                        }
                    },
                    paciente: {
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

        } else if (solicitante.role === 'SANITARIO') {
            const paciente = await prisma.paciente.findUnique({ where: { idUser: dniSolicitado } })

            if (!paciente || paciente.idFarmacia !== solicitante.sanitario.idFarmacia) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. The patient does not belong to your pharmacy.' })
            }

            tratamientos = await prisma.tratamiento.findMany({
                where: {
                    idPaciente: dniSolicitado
                },
                include: {
                    dosis: true,
                    registro: true,
                    sanitario: {
                        include: {
                            user: {
                                select: {
                                    dni: true,
                                    nombre: true,
                                    apellidos: true
                                }
                            }
                        }
                    },
                    paciente: {
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

        } else if (solicitante.role === 'TUTOR') {
            const paciente = await prisma.paciente.findUnique({
                where: { idUser: dniSolicitado },
                select: { idTutor: true, idFarmacia: true }
            })

            if (!paciente || paciente.idTutor !== dniSolicitante || paciente.idFarmacia !== solicitante.tutor.idFarmacia) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. You can only view treatments of your assigned patients within the same pharmacy.' })
            }

            tratamientos = await prisma.tratamiento.findMany({
                where: {
                    idPaciente: dniSolicitado
                },
                include: {
                    dosis: true,
                    registro: true,
                    sanitario: {
                        include: {
                            user: {
                                select: {
                                    dni: true,
                                    nombre: true,
                                    apellidos: true
                                }
                            }
                        }
                    },
                    paciente: {
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

        } else {
            return reply.status(403).send({ error: 'UNAUTHORIZED. You do not have permission to view these treatments.' })
        }

        return reply.status(200).send(tratamientos)
    } catch (error) {
        console.error("Error fetching all tratamientos:", error)
        return reply.status(500).send({ error: 'Error fetching all tratamientos.' })
    }
}

const getPendingTratamientosByDNI = async (req, reply) => {
    try {
        const dniSolicitante = req.headers.dnisolicitante
        const dniSolicitado = req.headers.dnisolicitado

        console.log("dniSolicitante:", dniSolicitante, "dniSolicitado:", dniSolicitado)

        if (!dniSolicitante || !dniSolicitado) {
            return reply.status(400).send({ error: 'Both dniSolicitante and dniSolicitado are required.' })
        }

        const solicitante = await prisma.user.findUnique({
            where: { dni: dniSolicitante },
            include: {
                sanitario: true,
                tutor: true,
                paciente: true
            }
        })

        if (!solicitante) {
            return reply.status(404).send({ error: 'Solicitante not found.' })
        }

        let tratamientos = []

        // Si el solicitante es el mismo paciente
        if (dniSolicitante === dniSolicitado && solicitante.role === ROLES.PACIENTE) {
            tratamientos = await prisma.tratamiento.findMany({
                where: {
                    idPaciente: dniSolicitado,
                    fecha_inicio: null
                }
            })

        } else if (solicitante.role === ROLES.SANITARIO) {
            const paciente = await prisma.paciente.findUnique({ where: { idUser: dniSolicitado } })

            if (!paciente || paciente.idFarmacia !== solicitante.sanitario.idFarmacia) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. The patient does not belong to your pharmacy.' })
            }

            tratamientos = await prisma.tratamiento.findMany({
                where: {
                    idPaciente: dniSolicitado,
                    fecha_inicio: null
                }
            })

        } else if (solicitante.role === ROLES.TUTOR) {
            const paciente = await prisma.paciente.findUnique({
                where: { idUser: dniSolicitado },
                select: { idTutor: true, idFarmacia: true }
            })

            if (!paciente || paciente.idTutor !== dniSolicitante || paciente.idFarmacia !== solicitante.tutor.idFarmacia) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. You can only view treatments of your assigned patients within the same pharmacy.' })
            }

            tratamientos = await prisma.tratamiento.findMany({
                where: {
                    idPaciente: dniSolicitado,
                    fecha_inicio: null
                }
            })

        } else {
            return reply.status(403).send({ error: 'UNAUTHORIZED. You do not have permission to view these treatments.' })
        }

        return reply.status(200).send(tratamientos)
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error fetching pending tratamientos.' })
    }
}

// Los sanitarios podrán registrar datos adicionales sobre los tratamientos
// no farmacológicos (de forma presencial, en la farmacia)
const registroDatosEnFarmacia = async (req, reply) => {
    try {
        const dniSolicitante = req.headers.dnisolicitante
        const idTratamiento = parseInt(req.headers.idtratamiento)
        const detalles = req.body.detalles || ''
        const fechaRegistro = req.body.fecha_registro ? new Date(req.body.fecha_registro) : new Date()

        if (!dniSolicitante || !idTratamiento) {
            return reply.status(400).send({ error: 'Both dniSolicitante and idTratamiento are required.' })
        }

        const solicitante = await prisma.user.findUnique({
            where: { dni: dniSolicitante },
            include: { sanitario: true }
        })

        if (!solicitante) {
            return reply.status(404).send({ error: 'Solicitante not found.' })
        }

        if (![ROLES.ADMIN, ROLES.SANITARIO].includes(solicitante.role)) {
            return reply.status(403).send({ error: 'UNAUTHORIZED: Only SANITARIOS or ADMIN can register additional data.' })
        }

        const tratamiento = await prisma.tratamiento.findUnique({
            where: { id: idTratamiento },
            include: { paciente: true }
        })

        if (!tratamiento) {
            return reply.status(404).send({ error: 'No se ha encontrado el tratamiento.' })
        }

        if (tratamiento.tipo !== 'NO_FARMACOLOGICO') {
            return reply.status(400).send({ error: 'Only non-pharmacological treatments can have additional data registered.' })
        }

        const sameFarmacia = await verifySameFarmacia(solicitante.dni, tratamiento.paciente.idUser)
        if (!sameFarmacia) {
            return reply.status(403).send({ error: 'UNAUTHORIZED: Users do not belong to the same pharmacy.' })
        }

        const existingRegistro = await prisma.registroTratamiento.findFirst({
            where: {
                idTratamiento,
                fecha_registro: {
                    gte: new Date(fechaRegistro.setHours(0, 0, 0, 0)),
                    lt: new Date(fechaRegistro.setHours(23, 59, 59, 999))
                }
            }
        })

        if (existingRegistro) {
            return reply.status(400).send({ error: 'Sólo se puede realizar un registro por día para este tipo de tratamiento.' })
        }

        const registro = await prisma.registroTratamiento.create({
            data: {
                idTratamiento,
                cumplimiento: true,
                detalles: detalles,
                fecha_registro: fechaRegistro
            }
        })

        return reply.status(201).send(registro)

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error registering additional data.' })
    }
}

const verifyCumplimiento = async (req, reply) => {
    try {
        const { idTratamiento } = req.body

        const tratamiento = await prisma.tratamiento.findUnique({
            where: {
                id: idTratamiento
            },
            include: {
                registros: true
            }
        })

        if (!tratamiento)
            return reply.status(404).send({ error: 'No se ha encontrado el tratamiento.' })

        const now = new Date()
        const lastRegistro = tratamiento.registro[tratamiento.registro.length - 1]
        const nextRegistroTime = new Date(lastRegistro.fecha_registro)
        nextRegistroTime.setHours(nextRegistroTime.getHours() + tratamiento.dosis.intervalo)

        if (now > nextRegistroTime)
            return reply.status(400).send({ error: 'No se ha registrado el cumplimiento del tratamiento a tiempo.' })

        return reply.status(200).send({ message: 'Cumplimiento registrado a tiempo.' })

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error verifying cumplimiento' })
    }

}

export const deleteTratamiento = async (req, reply, skipReply = false) => {
    try {
        const { id } = req.params
        let user = req.user

        if (!user.sanitario) {
            const fullUser = await prisma.user.findUnique({
                where: { dni: user.dni },
                include: { sanitario: true }
            })
            user = { ...user, sanitario: fullUser.sanitario }
        }

        if (
            user.role !== ROLES.ADMIN &&
            !(user.role === ROLES.SANITARIO && user.sanitario && user.sanitario.tipo === TIPO_SANITARIO.FARMACEUTICO)
        ) {
            if (!skipReply) return reply.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or FARMACEUTICO can delete treatments.' })
            return
        }

        const tratamiento = await prisma.tratamiento.findUnique({
            where: { id: parseInt(id) },
            include: { registro: true, dosis: true }
        })

        if (!tratamiento) {
            if (!skipReply) return reply.status(404).send({ error: 'Tratamiento not found.' })
            return
        }

        if (user.role !== ROLES.ADMIN) {
            const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.idPaciente)
            if (!sameFarmacia) {
                if (!skipReply) return reply.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })
                return
            }
        }

        await prisma.registroTratamiento.deleteMany({
            where: { idTratamiento: parseInt(id) }
        })

        if (tratamiento.dosis) {
            await prisma.dosis.delete({
                where: { id: tratamiento.dosis.id }
            })
        }

        await prisma.tratamiento.delete({
            where: { id: parseInt(id) }
        })

        if (!skipReply) return reply.status(204).send({ message: 'Tratamiento deleted.' })

    } catch (error) {
        console.error('Error deleting tratamiento:', error)
        if (!skipReply) return reply.status(500).send({ error: 'Error deleting tratamiento.' })
    }
}


const getTratamientoByID = async (req, reply) => {
    try {
        const { id } = req.params
        const user = req.user

        const tratamiento = await prisma.tratamiento.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                paciente: true,
                sanitario: true,
                dosis: true,
                registro: true
            }
        })

        if (!tratamiento) {
            return reply.status(404).send({ error: 'Tratamiento not found.' })
        }

        if (user.role === ROLES.ADMIN) {
            return reply.status(200).send(tratamiento)
        }

        if (user.role === ROLES.PACIENTE) {
            if (user.dni !== tratamiento.paciente.idUser) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. Only the patient can get this treatment.' })
            }
            return reply.status(200).send(tratamiento)
        }

        if (user.role === ROLES.TUTOR) {
            if (tratamiento.paciente.idTutor !== user.dni) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. Only the tutor can get this treatment.' })
            }
            return reply.status(200).send(tratamiento)
        }

        if (user.role === ROLES.SANITARIO) {
            const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.paciente.idUser)
            if (!sameFarmacia) {
                return reply.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })
            }
            return reply.status(200).send(tratamiento)
        }

        return reply.status(403).send({ error: 'UNAUTHORIZED. You do not have permission to access this treatment.' })

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error getting tratamiento.' })
    }
}

export const verifySameFarmacia = async (sanitarioID, pacienteID, tutorID = null) => {
    if (!sanitarioID) throw new Error("ID del sanitario es requerido para verificar la farmacia.")

    try {
        const sanitario = await prisma.sanitario.findUnique({
            where: { idUser: sanitarioID },
            select: { idFarmacia: true }
        })

        if (!sanitario) throw new Error('Sanitario no encontrado.')

        const paciente = await prisma.paciente.findUnique({
            where: { idUser: pacienteID },
            select: { idFarmacia: true }
        })

        if (!paciente) throw new Error('Paciente no encontrado.')

        if (sanitario.idFarmacia !== paciente.idFarmacia) {
            return false
        }

        if (tutorID) {
            const tutor = await prisma.tutor.findUnique({
                where: { idUser: tutorID },
                select: { pacientes: { select: { idFarmacia: true } } }
            })

            if (!tutor) throw new Error('Tutor no encontrado.')

            if (tutor.pacientes.some(p => p.idFarmacia !== sanitario.idFarmacia)) {
                return false
            }
        }

        return true
    } catch (error) {
        console.error('Error verifying same farmacia:', error)
        return false
    }
}

const getAdherenciaTratamiento = async (req, reply) => {

    /*  Adherencia parcial:
            - actual: número real de registros hasta la fecha actual
            - hipotética: número de registros que deberían haberse tomado hasta la fecha actual, 
                        basado en la frecuencia del tratamiento

        Adherencia total:
            - actual: número total de registros reales (dosis completadas) desde el inicio del tratamiento hasta la fecha actual
            - máximo:número total de registros hipotéticos para el tratamiento completo, mediante getMaxRegistros

        Si es el último día del tratamiento, se actualiza la puntuación del tratamiento con la adherencia total actual
    */

    try {
        const tratamientoReply = await new Promise((resolve, reject) => {
            const mockReply = {
                status: (code) => ({
                    send: (data) => resolve({ code, data })
                })
            }
            getTratamientoByID(req, mockReply).catch(reject)
        }) 

        if (tratamientoReply.code !== 200) 
            return reply.status(tratamientoReply.code).send(tratamientoReply.data) 

        const tratamiento = tratamientoReply.data 
        const maxRegistrosTotales = getMaxRegistros(tratamiento) 
        // console.log("EEEEEOOOOOmaxRegistrosTotales:", maxRegistrosTotales) 

        const fechaInicio = new Date(tratamiento.fecha_inicio) 
        const fechaActual = new Date() 
        const diasDesdeInicio = (fechaActual - fechaInicio) / (1000 * 60 * 60 * 24) 

        let registrosHipoteticosParciales 
        if (tratamiento.tipo === 'FARMACOLOGICO') 
            registrosHipoteticosParciales = Math.floor(diasDesdeInicio * (24 / tratamiento.dosis.intervalo)) 
        else 
            registrosHipoteticosParciales = Math.floor(diasDesdeInicio) 
        

        const registrosActualesParciales = tratamiento.registro.filter(registro => {
            return new Date(registro.fecha_registro) <= fechaActual 
        }).length 

        const adherencia = {
            adherenciaParcial: {
                actual: registrosActualesParciales,
                hipotetico: registrosHipoteticosParciales
            },
            adherenciaTotal: {
                actual: registrosActualesParciales,
                maximo: maxRegistrosTotales
            }
        } 

        const fechaFin = new Date(tratamiento.fecha_fin) 
        const lastDay = fechaActual.toDateString() === fechaFin.toDateString() 

        let puntuacionFinal = adherencia.adherenciaTotal.actual / adherencia.adherenciaTotal.maximo

        if (lastDay) {
            await prisma.tratamiento.update({
                where: { id: tratamiento.id },
                data: { puntuacion: puntuacionFinal }
            }) 
            console.log(`Actualización de puntuación final para tratamiento ${tratamiento.id}: ${puntuacionFinal}`) 
        }

        return reply.status(200).send(adherencia) 

    } catch (error) {
        console.error(error)
        return reply.status(500).send({ error: 'Error calculating treatment adherence.' })
    }
}

const getAdherenciaTotal = async (req, reply) => {
    try {
        const { dniPaciente } = req.params 

        const tratamientosFinalizados = await prisma.tratamiento.findMany({
            where: {
                idPaciente: dniPaciente,
                fecha_fin: { lt: new Date() }
            },
            select: {
                id: true,
                registro: true,
                dosis: true,
                fecha_inicio: true,
                fecha_fin: true,
                tipo: true,
                puntuacion: true
            }
        }) 

        if (!tratamientosFinalizados.length) {
            return reply.status(200).send({ adherenciaTotal: 0 }) 
        }

        let sumPuntuaciones = 0 
        let totalTratamientosValidos = 0 

        tratamientosFinalizados.forEach((tratamiento) => {
            if (new Date(tratamiento.fecha_inicio) >= new Date(tratamiento.fecha_fin)) {
                // console.warn(`Tratamiento ${tratamiento.id} tiene una fecha de inicio posterior a la fecha de fin. Se omitirá este tratamiento.`) 
                return  
            }

            const maxRegistros = getMaxRegistros(tratamiento) 
            const registrosActuales = tratamiento.registro.length 
            const adherenciaPorcentaje = registrosActuales / maxRegistros 

            sumPuntuaciones += adherenciaPorcentaje 
            totalTratamientosValidos += 1 
        }) 

        if (totalTratamientosValidos === 0) {
            return reply.status(200).send({ adherenciaTotal: 0 }) 
        }

        // Calcular la adherencia promedio (en porcentaje)
        const promedioAdherencia = (sumPuntuaciones / totalTratamientosValidos) * 100 

        return reply.status(200).send({ adherenciaTotal: Math.round(promedioAdherencia) }) 
    } catch (error) {
        console.error("Error calculando la adherencia total del paciente:", error) 
        return reply.status(500).send({ error: 'Error calculando la adherencia total del paciente.' }) 
    }
} 

function getMaxRegistros(tratamiento) {

    // Condición: fechas de inicio y fin definidas
    // FARMACOLÓGICO: registros según intervalo de dosis entre inicio y fin
    // NO FARMACOLÓGICO: un registro por día entre inicio y fin

    if (!tratamiento.fecha_inicio || !tratamiento.fecha_fin) {
        throw new Error('El tratamiento debe tener fecha de inicio y fecha de fin.')
    }

    const fechaInicio = new Date(tratamiento.fecha_inicio)
    const fechaFin = new Date(tratamiento.fecha_fin)

    const diferenciaTiempo = fechaFin - fechaInicio

    if (diferenciaTiempo < 0)
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin.')

    if (tratamiento.tipo === 'FARMACOLOGICO') {
        if (!tratamiento.dosis || !tratamiento.dosis.intervalo)
            throw new Error('El tratamiento farmacológico debe tener un intervalo de dosis definido.')

        const intervaloHoras = tratamiento.dosis.intervalo

        const diferenciaHoras = diferenciaTiempo / (1000 * 60 * 60)

        const maximoRegistros = Math.floor(diferenciaHoras / intervaloHoras) + 1

        return maximoRegistros

    } else if (tratamiento.tipo === 'NO_FARMACOLOGICO') {
        const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) + 1
        // console.log("diferenciaDias:", diferenciaDias)
        return diferenciaDias

    } else {
        throw new Error('Tipo de tratamiento no reconocido.')
    }
}

export default {
    createTratamiento,
    updateTratamiento,
    checkLastRegistro,
    registroTratamiento,
    getAllTratamientosByDNI,
    getPendingTratamientosByDNI,
    registroDatosEnFarmacia,
    getTratamientoByID,
    deleteTratamiento,
    verifyCumplimiento,
    getAdherenciaTratamiento,
    getAdherenciaTotal
}