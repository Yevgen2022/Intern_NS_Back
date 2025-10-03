import type { FastifyInstance } from "fastify";
import type { CreateLineItemData } from "../types/lineItems";

export function createLineItemRepo(fastify: FastifyInstance) {
	const db = fastify.prisma;
	return {
		create(data: CreateLineItemData) {
			return db.lineItem.create({ data });
		},
	};
}
