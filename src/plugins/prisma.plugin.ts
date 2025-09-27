import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

export default fp(async (app: FastifyInstance) => {

    //if decorator IS, we go out
    if (app.hasDecorator("prisma")) {
        app.log.warn("Prisma decorator already present — skip init");
        return;
    }

    const prisma = new PrismaClient();
    await prisma.$connect();

    app.decorate("prisma", prisma);

    app.addHook("onClose", async (fastify) => {
        await fastify.prisma.$disconnect();
    });
}, { name: "prisma" }); //  plugin's name
