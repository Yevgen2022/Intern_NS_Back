import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createCreativeRepo } from "../repository/creative.repository";
import { createLineItemRepo } from "../repository/lineItem.repository";
import { createLineItemWithCreative } from "../services/lineItem.services";
import { buildFormHtml } from "../view/lineitem.view";

export function lineItemController(fastify: FastifyInstance) {
	const deps = {
		lineItemRepo: createLineItemRepo(fastify),
		creativeRepo: createCreativeRepo(fastify),
	};

	return {
		// GET /adserver/lineitem/form
		getForm: async (_req: FastifyRequest, reply: FastifyReply) => {
			try {
				const html = buildFormHtml();
				return reply.type("text/html; charset=utf-8").send(html);
			} catch (error) {
				fastify.log.error(error);
				return reply.code(500).send({ error: "Failed to generate form" });
			}
		},

		saveCreative: async (req: FastifyRequest, reply: FastifyReply) => {
			try {
				const result = await createLineItemWithCreative(req, deps);
				return reply.code(201).send(result);
			} catch (error) {
				fastify.log.error(error);
				return reply.code(400).send({
					error:
						error instanceof Error
							? error.message
							: "Failed to create line item",
				});
			}
		},
	};
}
