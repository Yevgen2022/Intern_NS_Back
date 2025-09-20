// src/plugins/prisma.ts
import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
    const prisma = new PrismaClient()
    await prisma.$connect()

    // add prisma as a fastify property
    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async (fastify) => {
        await fastify.prisma.$disconnect()
    })
})

// so that TypeScript knows about fastify.prisma
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}
