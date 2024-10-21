import * as chai from 'chai';
import { PORT } from '../config/init.js';
import app from '../server.js';

const { expect } = chai;

describe('Admin User and Pharmacy Tests', () => {

    before(async () => {
        await app.listen({ port: PORT });
    });

    after(async () => {
        await app.close();
    });

    // Paso 1: Crear un usuario ADMIN
    it('should create an ADMIN user', async () => {
        const adminData = {
            dni: '10101010X',
            email: 'admin@admin.com',
            password: 'admin1',
            nombre: 'Admin',
            apellidos: 'Test',
            role: 'ADMIN'
        };

        // Usa la ruta con '/create'
        const res = await fetch(`http://localhost:${PORT}/users/create`, {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });

        const body = await res.json();
        expect(res.status).to.equal(201);
        expect(body).to.have.property('message', 'User created successfully.');
        expect(body.user).to.have.property('role', 'ADMIN');
    });

    // Paso 2: Crear una farmacia (solo ADMIN)
    it('should create a pharmacy as ADMIN', async () => {
        const farmaciaData = {
            nombre: 'Farmacia Gran Parque',
            direccion: 'Calle Principal, 1. Granada.'
        };

        // Usa la ruta con '/create'
        const res = await fetch(`http://localhost:${PORT}/farmacias/create`, {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(farmaciaData)
        });

        const body = await res.json();
        expect(res.status).to.equal(201);
        expect(body).to.have.property('nombre', 'Farmacia Central');
    });

    it('should not allow non-ADMIN to create a pharmacy', async () => {
        const farmaciaData = {
            nombre: 'Farmacia FGL',
            direccion: 'Avda. FGL, 4'
        };

        // Usa la ruta con '/create'
        const res = await fetch(`http://localhost:${PORT}/farmacias/create`, {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(farmaciaData)
        });

        const body = await res.json();
        expect(res.status).to.equal(403);
        expect(body).to.have.property('error', 'UNAUTHORIZED. Only an ADMIN can create a pharmacy.');
    });
});
