import type { FastifyInstance } from "fastify";
import type { CreateCreativeData } from "../types/lineItems";

export function createCreativeRepo(fastify: FastifyInstance) {
	const db = fastify.prisma;
	return {
		create(data: CreateCreativeData) {
			return db.creative.create({ data });
		},
	};
}
