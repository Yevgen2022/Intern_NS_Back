// src/plugins/prisma.plugin.ts

import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
	interface FastifyInstance {
		prisma: PrismaClient;
	}
}

export default fp(async (app: FastifyInstance) => {
	const prisma = new PrismaClient();
	await prisma.$connect();

	app.decorate("prisma", prisma);

	app.addHook("onClose", async (fastify) => {
		await fastify.prisma.$disconnect();
	});
});
