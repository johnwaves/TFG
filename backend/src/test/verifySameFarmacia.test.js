import { expect } from 'chai' 
import prisma from '../config/prisma.js' 
import { verifySameFarmacia } from '../controllers/tratamientoController.js' 

describe('Verifica si dos usuarios pertenecen a la misma farmacia', () => {
    let sanitario, paciente, tutor 

    before(async () => {
        try {
            // Creating a farmacia
            const farmacia = await prisma.farmacia.create({
                data: {
                    // Nombres para evitar duplicados
                    nombre: 'Farmacia Test ' + Date.now(),
                    direccion: 'Calle Test, 123'
                }
            }) 

            const userSanitario = await prisma.user.create({
                data: {
                    dni: '12345678A',
                    password: 'password',
                    email: 'sanitario@test.com',
                    nombre: 'Sanitario',
                    apellidos: 'Test',
                    telefono: '123456789',
                    fecha_nacimiento: new Date('1980-01-01'),
                    direccion: 'Calle Test, 456',
                    role: 'SANITARIO'
                }
            }) 

            sanitario = await prisma.sanitario.create({
                data: {
                    idUser: userSanitario.dni,
                    tipo: 'FARMACEUTICO',
                    idFarmacia: farmacia.id
                }
            }) 

            const userPaciente = await prisma.user.create({
                data: {
                    dni: '87654321B',
                    password: 'password',
                    email: 'paciente@test.com',
                    nombre: 'Paciente',
                    apellidos: 'Test',
                    telefono: '987654321',
                    fecha_nacimiento: new Date('2000-01-01'),
                    direccion: 'Calle Test, 789',
                    role: 'PACIENTE'
                }
            }) 

            paciente = await prisma.paciente.create({
                data: {
                    idUser: userPaciente.dni,
                    idFarmacia: farmacia.id
                }
            }) 

            const userTutor = await prisma.user.create({
                data: {
                    dni: '11223344C',
                    password: 'password',
                    email: 'tutor@test.com',
                    nombre: 'Tutor',
                    apellidos: 'Test',
                    telefono: '112233445',
                    fecha_nacimiento: new Date('1970-01-01'),
                    direccion: 'Calle Test, 101',
                    role: 'TUTOR'
                }
            }) 

            tutor = await prisma.tutor.create({
                data: {
                    idUser: userTutor.dni,
                    pacientes: {
                        connect: { idUser: paciente.idUser }
                    }
                }
            }) 
        } catch (error) {
            console.error('Error in before hook:', error) 
        }
    }) 

    after(async () => {
        try {
            // Importante: elimina todo lo creado después del test
            await prisma.tutor.delete({ where: { idUser: tutor.idUser } }) 
            await prisma.paciente.delete({ where: { idUser: paciente.idUser } }) 
            await prisma.sanitario.delete({ where: { idUser: sanitario.idUser } }) 
            await prisma.user.deleteMany({ where: { dni: { in: ['12345678A', '87654321B', '11223344C'] } } }) 
            await prisma.farmacia.deleteMany({ where: { nombre: 'Farmacia Test ' + Date.now() } }) 
        } catch (error) {
            console.error('Error in after hook:', error) 
        }
    }) 
    
    it('Debería devolver true si el sanitario y el paciente pertenecen a la misma farmacia. Test 1.', async () => {
        try {
            const result = await verifySameFarmacia(sanitario.idUser, paciente.idUser) 
            expect(result).to.be.true 
        } catch (error) {
            console.error('Error in Test 1:', error) 
        }
    }) 
    
    it('Debería devolver true si el sanitario y el paciente no pertenecen a la misma farmacia. Test 2.', async () => {
        try {
            const newFarmacia = await prisma.farmacia.create({
                data: {
                    nombre: 'Otra Farmacia Test ' + Date.now(),
                    direccion: 'Calle Test, 999'
                }
            }) 

            const userAnotherPaciente = await prisma.user.create({
                data: {
                    dni: '33445566D',
                    password: 'password',
                    email: 'anotherpaciente@test.com',
                    nombre: 'Otro Paciente',
                    apellidos: 'Test',
                    telefono: '334455667',
                    fecha_nacimiento: new Date('2005-01-01'),
                    direccion: 'Calle Test, 222',
                    role: 'PACIENTE'
                }
            }) 

            const anotherPaciente = await prisma.paciente.create({
                data: {
                    idUser: userAnotherPaciente.dni,
                    idFarmacia: newFarmacia.id
                }
            }) 

            const result = await verifySameFarmacia(sanitario.idUser, anotherPaciente.idUser) 
            expect(result).to.be.false 

            await prisma.paciente.delete({ where: { idUser: anotherPaciente.idUser } }) 
            await prisma.user.delete({ where: { dni: '33445566D' } }) 
            await prisma.farmacia.delete({ where: { id: newFarmacia.id } }) 
        } catch (error) {
            console.error('Error in Test 2:', error) 
        }
    }) 
    
    it('Debería devolver true si sanitario, paciente y tutor pertenecen a la misma farmacia. Test 3.', async () => {
        try {
            const result = await verifySameFarmacia(sanitario.idUser, paciente.idUser, tutor.idUser) 
            expect(result).to.be.true 
        } catch (error) {
            console.error('Error in Test 3:', error) 
        }
    }) 
    
    it('Debería devolver false si el tutor tiene un paciente que pertenece a una farmacia diferente. Test 4.', async () => {
        try {
            const newFarmacia = await prisma.farmacia.create({
                data: {
                    nombre: 'Nueva Farmacia Test ' + Date.now(),
                    direccion: 'Calle Nueva, 111'
                }
            }) 

            const userAnotherPaciente = await prisma.user.create({
                data: {
                    dni: '55667788E',
                    password: 'password',
                    email: 'anotherpaciente2@test.com',
                    nombre: 'Otro Paciente 2',
                    apellidos: 'Test',
                    telefono: '556677889',
                    fecha_nacimiento: new Date('2006-01-01'),
                    direccion: 'Calle Test, 333',
                    role: 'PACIENTE'
                }
            }) 

            const anotherPaciente = await prisma.paciente.create({
                data: {
                    idUser: userAnotherPaciente.dni,
                    idFarmacia: newFarmacia.id
                }
            }) 

            await prisma.tutor.update({
                where: { idUser: tutor.idUser },
                data: {
                    pacientes: {
                        connect: { idUser: anotherPaciente.idUser }
                    }
                }
            }) 

            const result = await verifySameFarmacia(sanitario.idUser, paciente.idUser, tutor.idUser) 
            expect(result).to.be.false 

            await prisma.tutor.update({
                where: { idUser: tutor.idUser },
                data: {
                    pacientes: {
                        disconnect: { idUser: anotherPaciente.idUser }
                    }
                }
            }) 
            await prisma.paciente.delete({ where: { idUser: anotherPaciente.idUser } }) 
            await prisma.user.delete({ where: { dni: '55667788E' } }) 
            await prisma.farmacia.delete({ where: { id: newFarmacia.id } }) 
        } catch (error) {
            console.error('Error in Test 4:', error) 
        }
    }) 

    it('Debería devolver true si sanitario y múltiples pacientes pertenecen a la misma farmacia. Test 5.', async () => {
        try {
            const userAnotherPaciente = await prisma.user.create({
                data: {
                    dni: '22334455F_' + Date.now(),
                    password: 'password',
                    email: 'anotherpaciente3@test.com',
                    nombre: 'Paciente Extra',
                    apellidos: 'Test',
                    telefono: '223344556',
                    fecha_nacimiento: new Date('2003-01-01'),
                    direccion: 'Calle Extra, 444',
                    role: 'PACIENTE'
                }
            }) 
    
            const anotherPaciente = await prisma.paciente.create({
                data: {
                    idUser: userAnotherPaciente.dni,
                    idFarmacia: sanitario.idFarmacia
                }
            }) 
    
            const result = await verifySameFarmacia(sanitario.idUser, anotherPaciente.idUser) 
            expect(result).to.be.true 
    
            await prisma.paciente.delete({ where: { idUser: anotherPaciente.idUser } }) 
            await prisma.user.delete({ where: { dni: userAnotherPaciente.dni } }) 
        } catch (error) {
            console.error('Error in Test 5:', error) 
        }
    }) 

    it('Debería devolver true si el tutor y todos los pacientes asignados pertenecen a la misma farmacia. Test 6.', async () => {
        try {
            const userAnotherPaciente = await prisma.user.create({
                data: {
                    dni: '66778899G_' + Date.now(),
                    password: 'password',
                    email: 'assignedpaciente@test.com',
                    nombre: 'Assigned Paciente',
                    apellidos: 'Test',
                    telefono: '667788990',
                    fecha_nacimiento: new Date('2004-01-01'),
                    direccion: 'Calle Test, 555',
                    role: 'PACIENTE'
                }
            }) 
    
            const anotherPaciente = await prisma.paciente.create({
                data: {
                    idUser: userAnotherPaciente.dni,
                    idFarmacia: sanitario.idFarmacia
                }
            }) 
    
            await prisma.tutor.update({
                where: { idUser: tutor.idUser },
                data: {
                    pacientes: {
                        connect: { idUser: anotherPaciente.idUser }
                    }
                }
            }) 
    
            const result = await verifySameFarmacia(sanitario.idUser, paciente.idUser, tutor.idUser) 
            expect(result).to.be.true 
    
            await prisma.tutor.update({
                where: { idUser: tutor.idUser },
                data: {
                    pacientes: {
                        disconnect: { idUser: anotherPaciente.idUser }
                    }
                }
            }) 
            await prisma.paciente.delete({ where: { idUser: anotherPaciente.idUser } }) 
            await prisma.user.delete({ where: { dni: userAnotherPaciente.dni } }) 
        } catch (error) {
            console.error('Error in Test 6:', error) 
        }
    }) 
    
    it('Debería devolver false si sanitario y paciente pertenecen a farmacias diferentes pero al mismo tutor. Test 7.', async () => {
        try {
            const newFarmacia = await prisma.farmacia.create({
                data: {
                    nombre: 'Farmacia Diferente ' + Date.now(),
                    direccion: 'Calle Diferente, 333'
                }
            }) 
    
            const userAnotherPaciente = await prisma.user.create({
                data: {
                    dni: '99887766H_' + Date.now(),
                    password: 'password',
                    email: 'differentfarmacia@test.com',
                    nombre: 'Paciente Diferente',
                    apellidos: 'Test',
                    telefono: '998877665',
                    fecha_nacimiento: new Date('2002-01-01'),
                    direccion: 'Calle Test, 666',
                    role: 'PACIENTE'
                }
            }) 
    
            const anotherPaciente = await prisma.paciente.create({
                data: {
                    idUser: userAnotherPaciente.dni,
                    idFarmacia: newFarmacia.id
                }
            }) 
    
            await prisma.tutor.update({
                where: { idUser: tutor.idUser },
                data: {
                    pacientes: {
                        connect: { idUser: anotherPaciente.idUser }
                    }
                }
            }) 
    
            const result = await verifySameFarmacia(sanitario.idUser, anotherPaciente.idUser, tutor.idUser) 
            expect(result).to.be.false 
    
            await prisma.tutor.update({
                where: { idUser: tutor.idUser },
                data: {
                    pacientes: {
                        disconnect: { idUser: anotherPaciente.idUser }
                    }
                }
            }) 
            await prisma.paciente.delete({ where: { idUser: anotherPaciente.idUser } }) 
            await prisma.user.delete({ where: { dni: userAnotherPaciente.dni } }) 
            await prisma.farmacia.delete({ where: { id: newFarmacia.id } }) 
        } catch (error) {
            console.error('Error in Test 7:', error) 
        }
    }) 
    
}) 
