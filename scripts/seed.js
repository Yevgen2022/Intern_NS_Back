// scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.feed.create({
            data: {
                sourceUrl: 'https://example.com/rss',
                items: [{ title: 'Hello Mongo!', link: 'https://example.com/1' }],
            },
        });
        console.log('Created new doc');
    } catch (e) {
        if (e.code === 'P2002') {
            await prisma.feed.update({
                where: { sourceUrl: 'https://example.com/rss' },
                data: { items: [{ title: 'Updated!', link: 'https://example.com/2' }] },
            });
            console.log('Updated existing doc');
        } else {
            throw e;
        }
    }
}

main().finally(() => prisma.$disconnect());
