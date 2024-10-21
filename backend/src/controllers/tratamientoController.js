import prisma from '../config/prisma.js'
import { ROLES, TIPO_SANITARIO } from '../utils/roles.js';

// CRUD operations for tratamientos
/*

Hay que tener en cuenta que a la vez que se crea un tratamiento se debe especificar
el tipo del que es (FARMACOLÓGICO o NO FARMACOLÓGICO). 
En caso de ser farmacológico, se debe crear un objeto de tipo Dosis especificando la
cantidad de medicación a tomar (normalmente en miligramos), el
intervalo (cada x horas) y la duración (en días). Inicialmente, hasta que no empiece a tomarse
la medicación, la fecha de inicio y de fin no se especifica. La fecha
de fin será la fecha de inicio más la duración del tratamiento. Deberá haber una comprobación
para verificar si hay o no tratamientos pendientes de empezar (sin fecha de inicio ni de fin).

En caso de ser no farmacológico,
no se crean dosis y la fecha de inicio debe el mismo día que se crea el
tratamiento. La fecha de fin se especifica en el momento de la creación
del tratamiento.

Indiferentemente del tipo de tratamiento, hay un array del tipo RegistroTratamiento,
el cual debería tener tantas posiciones como el producto del intervalo por la duración
del tratamiento y deberá ser completado por el paciente o el tutor, en caso
de que el paciente sea menor de edad o persona dependiente. En cada posición, se debe especificar: cumplimiento (booleano) para 
comprobar si el paciente ha cumplido con el tratamiento en esa vez,
detalles (añadir una descripción de cómo se ha tomado el tratamiento, si ha habido y si se quiere. Si no,
se tendrá que especificar si se ha tomado tarde o cualquier otra indicación. Se puede dejar en blanco también) y fecha y hora (la fecha en la que se ha tomado el tratamiento).

Los sanitarios pueden crear tratamientos para los pacientes.
Los farmacéuticos serán el único tipo de sanitario que podrá
modificar dichos tratamientos, añadiendo o eliminando dosis, cambiando
el intervalo y la duración.
Ni los técnicos ni los pacientes o tutores no podrán cambiar el tratamiento una vez creado.

Para los tratamientos, el paciente o su tutor (dadas las circunstancias),
serán quieren añadan el registro manualmente (todos los registros se añaden manualmente). Por ejemplo, si el tratamiento es farmacológico y el paciente debe
tomar una dosis de cierta cantidad de medicación cada X horas durante Y días, si no hay registros previos, se deberá
crear un primer registro, a partir del cual se establecerá la fecha de inicio y de fin del tratamiento calculándose
como se ha especificado anteriormente. Una vez realizada la primera toma (registro),
deberá añadir nuevamente un registro no antes de esas X horas, indicando que ha tomado la medicación, y así hasta concluir
los Y días de tratamiento.

Si ha tomado la medicación más tarde de esas X horas (por ejemplo, media hora o dos horas más tarde), 
podrá crear igualmente un registro, pero esta vez la siguiente toma (registro) deberá ser a las X horas
desde la última (desde el momento que se ha realizado ese último registro).

Los sanitarios también podrán añadir registros de tratamiento no farmacológico en cualquier momento, pero preferiblemente
lo harán cuando el paciente acuda a la farmacia. Esto es debido a que se pueden
recetar tratamientos como cambios en los hábitos de vida, dietas, entre otros.
Para ello, el registro que harán los sanitarios (tanto farmacéuticos como técnicos)
será del tipo añadir la temperatura, la masa corporal, 
la tensión, entre otros. Todo eso se añadirá a la descripción del registro.
Si se ha realizado un registro de tratamiento no farmacológico en un día, no se podrá
realizar otro registro ese mismo día. 

*/

const createTratamiento = async (res, req) => {
    try {
        const { nombre, descripcion, tipo, idPaciente, dosis, fecha_fin } = req.body
        const user = req.user

        if (!user) return res.status(401).send({ error: 'UNAUTHORIZED. You must be logged in to create treatments.' })
        
        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO)
            return res.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can create treatments.' })

        if (user.role === ROLES.SANITARIO && ![TIPO_SANITARIO.FARMACEUTICO, TIPO_SANITARIO.TECNICO].includes(user.sanitario.tipo))
            return res.status(403).send({ error: 'UNAUTHORIZED. Only a FARMACEUTICO or TECNICO can create treatments.' })

        const paciente = await prisma.paciente.findUnique({
            where: {
                idUser: idPaciente
            }
        })
        if (!paciente) return res.status(400).send({ error: 'El paciente no existe.' })

        const sameFarmacia = await verifySameFarmacia(user.id, paciente.idUser, paciente.idTutor)
        if (!sameFarmacia) 
            return res.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })

        
        if (!fecha_fin) return res.status(400).send({ error: 'La fecha de fin es requerida.' })
        if (!nombre) return res.status(400).send({ error: 'El nombre del tratamiento es requerido.' })
        if (!descripcion) return res.status(400).send({ error: 'La descripción del tratamiento es requerida.' })
        if (!tipo) return res.status(400).send({ error: 'El tipo del tratamiento es requerido.' })

        if (tipo === 'FARMACOLOGICO') {

            if (!dosis) return res.status(400).send({ error: 'La dosis es requerida.' })

            // Comprobaciones adicionales
            if (!dosis.cantidad) return res.status(400).send({ error: 'La cantidad de medicación es requerida.' })
            if (dosis.cantidad <= 0) return res.status(400).send({ error: 'La cantidad de medicación debe ser mayor que 0.' })
            
            if (!dosis.intervalo) return res.status(400).send({ error: 'El intervalo de tiempo (en horas) es requerido.' })
            if (dosis.intervalo <= 0) return res.status(400).send({ error: 'El intervalo de tiempo (en horas) debe ser mayor que 0.' })
            if (!Number.isInteger(dosis.intervalo)) return res.status(400).send({ error: 'El intervalo de tiempo (en horas) debe ser un número entero.' })

            if (!dosis.duracion) return res.status(400).send({ error: 'La duración del tratamiento es requerida.' })
            if (dosis.duracion <= 0) return res.status(400).send({ error: 'La duración del tratamiento (en días) debe ser mayor que 0.' })
            if (!Number.isInteger(dosis.duracion)) return res.status(400).send({ error: 'La duración del tratamiento (en días) debe ser un número entero.' })

            const newDosis = await prisma.dosis.create({
                data: {
                    cantidad: dosis.cantidad,
                    intervalo: dosis.intervalo,
                    duracion: dosis.duracion
                }
            })

            const tratamiento = await prisma.tratamiento.create({
                data: {
                    nombre,
                    descripcion,
                    tipo,
                    idSanitario: user.id,
                    idPaciente,
                    idDosis: newDosis.id
                }
            })

            return res.status(201).send(tratamiento)
        }

        if (tipo === 'NO_FARMACOLOGICO'){

            const tratamiento = await prisma.tratamiento.create({
                data: {
                    nombre,
                    descripcion,
                    tipo,
                    idSanitario: user.id,
                    idPaciente,
                    fecha_inicio: new Date(),
                    fecha_fin: new Date(fecha_fin)
                }
            })

            return res.status(201).send(tratamiento)

        }

        return res.status(400).send({ error: 'El tipo de tratamiento no es válido.' })


            
    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error creating tratamiento.' })
    }

}

const updateTratamiento = async (res, req) => {
    try {
        const { idTratamiento, dosis, fecha_fin, tipo } = req.body
        const user = req.user

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO)
            return res.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can update treatments.' })

        if (user.role !== ROLES.SANITARIO || user.sanitario.tipo !== TIPO_SANITARIO.FARMACEUTICO)
            return res.status(403).send({ error: 'UNAUTHORIZED. Only a FARMACEUTICO can update treatments.' })

        const tratamiento = await prisma.tratamiento.findUnique({
            where: {
                id: idTratamiento
            }
        })
        if (!tratamiento) return res.status(400).send({ error: 'No se ha encontrado el tratamiento.' })

        const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.idPaciente)
        if (!sameFarmacia) 
            return res.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })

        if (tipo === 'FARMACOLOGICO' && dosis) {
            const updateDosis = await prisma.dosis.update({
                where: {
                    id: tratamiento.idDosis
                },
                data: {
                    cantidad: dosis.cantidad,
                    intervalo: dosis.intervalo,
                    duracion: dosis.duracion
                }
            })

            return res.status(200).send(updateDosis)

        }

        if (tipo === 'NO_FARMACOLOGICO' && fecha_fin) {
            const updateTratamiento = await prisma.tratamiento.update({
                where: {
                    id: idTratamiento
                },
                data: {
                    fecha_fin: new Date(fecha_fin)
                }
            })

            return res.status(200).send(updateTratamiento)

        }

        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error updating tratamiento.' })
    }
}

const registroTratamiento = async (res, req) => {
    try {
        const { idTratamiento, cumplimiento, detalles, fecha_registro } = req.body
        const user = req.user
        const tratamiento = await prisma.tratamiento.findUnique({
            where: {
                id: idTratamiento
            }, 
            include: {
                paciente: true,
                sanitario: true
            }
        })

        if (!tratamiento) return res.status(400).send({ error: 'No se ha encontrado el tratamiento.' })
        
        // Otra forma: tratamiento.paciente.idUser
        const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.idPaciente, tratamiento.paciente.idTutor || null)
        if (!sameFarmacia) 
            return res.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })



        if (tratamiento.tipo === 'FARMACOLOGICO') {

            if (user.role === ROLES.PACIENTE && user.dni !== tratamiento.paciente.idUser)
                return res.status(403).send({ error: 'UNAUTHORIZED. Only the patient can add a RegistroTratamiento.' })

            if (user.role === ROLES.TUTOR && user.dni !== tratamiento.paciente.idTutor)
                return res.status(403).send({ error: 'UNAUTHORIZED. Only the tutor can add a RegistroTratamiento.' })

            const lastRegistro = await prisma.registroTratamiento.findFirst({
                where: {
                    idTratamiento
                },
                orderBy: {
                    fecha_registro: 'desc'
                }
            })

            if (lastRegistro) {
                const lastRegistroTime = new Date(lastRegistro.fecha_registro)
                const nextAllowedTime = new Date(lastRegistroTime)

                nextAllowedTime.setHours(nextAllowedTime.getHours() + tratamiento.dosis.intervalo)

                if (new Date(fecha_registro) < nextAllowedTime)
                    return res.status(400).send({ error: `Se podrá añadir un nuevo registro después del intervalo de ${tratamiento.dosis.intervalo} horas.` })

            }


        } // elseif
        
        if (tratamiento.tipo === 'NO_FARMACOLOGICO') {

            if (user.role === ROLES.SANITARIO && user.sanitario.idFarmacia !== tratamiento.paciente.idFarmacia)
                return res.status(403).send({ error: 'UNAUTHORIZED. You can only add treatments for patients from your own pharmacy.' })

            const existingRegistro = await prisma.registroTratamiento.findFirst({
                where: {
                    idTratamiento,
                    fecha_registro: {
                        // Se verifica desde el inicio del día
                        gte: new Date(new Date().setHours(0,0,0,0))
                    }
                }
            })

            if (existingRegistro) return res.status(400).send({ error: 'Sólo se puede añadir un registro al día para este tipo de tratamiento.' })
        }

        const registro = await prisma.registroTratamiento.create({
            data: {
                idTratamiento,
                cumplimiento,
                detalles: detalles || '',
                fecha_registro: new Date(fecha_registro)
            }
        })

        return res.status(201).send(registro)

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error registering treatment compliance.' })
    }


}

const getPendingTratamientos = async (req, res) => {
    try {
        const user = req.user

        let tratamientos = []
        if (user.role === ROLES.PACIENTE){
            tratamientos = await prisma.tratamiento.findMany({
                where: { 
                    idPaciente: user.dni,
                    fecha_inicio: null,
                    fecha_fin: null
                 }
            })

        } else if (user.role === ROLES.TUTOR){
            tratamientos = await prisma.tratamiento.findMany({
                where:{
                    paciente: {
                        idTutor: user.dni
                    },
                    fecha_inicio: null,
                    fecha_fin: null
                }
            })

        } else if (user.role === ROLES.SANITARIO){
            tratamientos = await prisma.tratamiento.findMany({
                where: {
                    paciente: {
                        idFarmacia: user.sanitario.idFarmacia
                    },
                    fecha_inicio: null,
                    fecha_fin: null
                }
            })

        }

        return res.status(200).send(tratamientos)

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error fetching pending tratamientos.' })
    }

}

// Los sanitarios podrán registrar datos adicionales sobre los tratamientos
// no farmacológicos (de forma presencial, en la farmacia)
const registroDatosEnFarmacia = async (req, res) => {
    try {
        const { idTratamiento, detalles } = req.body
        const user = req.user
        if (user.role !== ROLES.SANITARIO)
            return res.status(403).send({ error: 'UNAUTHORIZED: Only SANITARIOS can register additional data' })
        
        const tratamiento = await prisma.tratamiento.findUnique({
            where: {
                id: idTratamiento
            },
            include: {
                paciente: true
            }
        })

        if (!tratamiento)
            return res.status(404).send({ error: 'No se ha encontrado el tratamiento.'})

        const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.paciente.idUser)
        if (!sameFarmacia)
            return res.status(403).send({ error: 'Usuarios no pertenecen a la misma farmacia'})

        const existingRegistro = await prisma.registroTratamiento.findFirst({
            where:{
                idTratamiento,
                fecha_registro: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        })

        if (existingRegistro)
            return res.status(400).send({ error: 'Sólo se puede realizar un registro por día.'})

        const registro = await prisma.registroTratamiento.create({
            data: {
                idTratamiento,
                cumplimiento: true,
                detalles: detalles || '',
                fecha_registro: new Date()
            }
        })

        return res.status(201).send(registro)

    } catch (error){
        console.error(error)
        return res.status(500).send({ error: 'Error rgistering additional data'})
    }
}

const verifyCumplimiento = async (req, res) => {
    try {
        const {idTratamiento } = req.body

        const tratamiento = await prisma.tratamiento.findUnique({
            where: {
                id: idTratamiento
            },
            include: {
                registros: true
            }
        })

        if (!tratamiento)
            return res.status(404).send({ error: 'No se ha encontrado el tratamiento.'})

        const now =  new Date()
        const lastRegistro = tratamiento.registro[tratamiento.registro.length - 1]
        const nextRegistroTime = new Date(lastRegistro.fecha_registro)
        nextRegistroTime.setHours(nextRegistroTime.getHours() + tratamiento.dosis.intervalo)

        if (now > nextRegistroTime)
            return res.status(400).send({ error: 'No se ha registrado el cumplimiento del tratamiento a tiempo.'})

        return res.status(200).send({ message: 'Cumplimiento registrado a tiempo.'})

    } catch (error){
        console.error(error)
        return res.status(500).send({ error: 'Error verifying cumplimiento'})
    }

}

const deleteTratamiento = async (req, res) => {
    try {
        const { id } = req.params
        const user = req.user

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO)
            return res.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can delete treatments.' })

        if (user.role !== ROLES.SANITARIO || user.sanitario.tipo !== TIPO_SANITARIO.FARMACEUTICO)
            return res.status(403).send({ error: 'UNAUTHORIZED. Only a FARMACEUTICO can delete treatments.' })

        const tratamiento = await prisma.tratamiento.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!tratamiento) return res.status(404).send({ error: 'Tratamiento not found.' })

        const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.idPaciente)
        if (!sameFarmacia) 
            return res.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })

        await prisma.tratamiento.delete({
            where: {
                id: parseInt(id)
            }
        })

        return res.status(204).send()

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error deleting tratamiento.' })
    }

}

const getTratamientoByID = async (req, res) => {
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
                dosis: true
            }

        })

        if (!tratamiento) return res.status(404).send({ error: 'Tratamiento not found.' })

        if (user.role !== ROLES.ADMIN && user.role !== ROLES.SANITARIO)
            return res.status(403).send({ error: 'UNAUTHORIZED. Only an ADMIN or SANITARIO can get treatments.' })

        if (user.role === ROLES.SANITARIO){
            const sameFarmacia = await verifySameFarmacia(user.dni, tratamiento.paciente.idUser)
            if (!sameFarmacia) 
                return res.status(403).send({ error: 'UNAUTHORIZED. Users do not belong to the same pharmacy.' })
        }

        return res.status(200).send(tratamiento)


    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: 'Error getting tratamiento.' })
    }   

}

// Añadir función para verificar si se ha marcado o no la casilla de cumplimiento

const verifySameFarmacia = async (sanitarioID, pacienteID, tutorID = null) => {
    try {
        const sanitario = await prisma.sanitario.findUnique({
            where: {
                idUser: sanitarioID
            },
            select: {
                idFarmacia: true
            }
        })

        if (!sanitario) throw new Error('Sanitario not found.')
        
        // Comprueba la farmacia del paciente
        const paciente = await prisma.paciente.findUnique({
            where: {
                idUser: pacienteID
            },
            select: {
                idFarmacia: true
            }
        })

        if (!paciente) throw new Error('Paciente not found.')
        
        // Los pacientes pueden no tener tutor. La comprobación se hace entre el sanitario y el paciente
        //if (!tutorID) return sanitario.idFarmacia === paciente.idFarmacia
        if (tutorID){
            const tutor = await prisma.tutor.findUnique({
                where: {idUser: tutorID},
                select: { 
                    pacientes:{
                        select: {
                            idFarmacia: true
                        }
                    }
                }
            })

            if (!tutor || tutor.pacientes.some(p => p.idFarmacia !== sanitario.idFarmacia)) return false

        }

        return sanitario.idFarmacia === paciente.idFarmacia


    } catch (error) {
        console.error('Error verifying same farmacia:', error)
        return false
    }

}

export default{
    createTratamiento,
    updateTratamiento,
    registroTratamiento,
    getPendingTratamientos,
    registroDatosEnFarmacia,
    getTratamientoByID,
    deleteTratamiento,
    verifyCumplimiento
}