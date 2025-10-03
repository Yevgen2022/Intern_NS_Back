"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed:users.ts
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
function generateToken() {
    return (0, crypto_1.randomBytes)(32).toString('base64url'); // 43–44 символи
}
async function main() {
    // Hash for "password123"
    const passwordHash = await (0, bcrypt_1.hash)('password123', 10);
    // 1) We create a user
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            passwordHash,
            name: 'Test User',
            role: 'user',
        },
    });
    console.log('User created:', user);
    // 2) Create a session for this user
    const token = generateToken();
    const session = await prisma.session.create({
        data: {
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 години
        },
    });
    console.log('Session created:', session);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
