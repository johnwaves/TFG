import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12

export async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS)
    } catch (error) {
        console.error('Error hashing password:', error)
        throw new Error('Failed to hash password')
    }
}

export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword)
}

/*
async function generateHashedPassword() {
    const plainPassword = 'admin1234'

    try {
        const hashedPassword = await hashPassword(plainPassword);
        console.log('Contraseña cifrada:', hashedPassword)
    } catch (error) {
        console.error('Error generando la contraseña cifrada:', error)
    }
}

generateHashedPassword()
*/