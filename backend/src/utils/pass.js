const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12

async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS)
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
}

module.exports = { hashPassword}