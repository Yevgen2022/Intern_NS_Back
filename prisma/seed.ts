// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateToken(): string {
    return randomBytes(32).toString('base64url'); // 43–44 символи
}

async function main() {
    // Хеш для "password123"
    const passwordHash = await hash('password123', 10);

    // 1) Створюємо користувача
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            passwordHash,
            name: 'Test User',
            role: 'user',
        },
    });

    console.log('User created:', user);

    // 2) Створюємо сесію для цього юзера
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
