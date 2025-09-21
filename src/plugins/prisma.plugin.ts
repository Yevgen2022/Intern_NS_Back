import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

// FastifyInstance modular extension (to make request.server.prisma typed)
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

	//(optional) download log
	// if (typeof app.pluginLoaded === 'function') {
	// 	app.pluginLoaded('prisma')
	// }
});
