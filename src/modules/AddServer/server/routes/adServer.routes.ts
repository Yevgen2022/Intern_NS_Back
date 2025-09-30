import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { adServerController } from "../controllers/adServer.controller";
import {
	bidRequestSchema,
	bidResponseSchema,
	noBidResponseSchema,
} from "../schemas/adServer.schemas";

// AdServer routes registration
// Primary endpoint: POST /api/adserver/bid

export async function adServerRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
	const controller = adServerController(fastify);

	// POST /api/adserver/bid — get the best matching line item
	route.post(
		"/adserver/bid",
		{
			schema: {
				body: bidRequestSchema,
				response: {
					200: bidResponseSchema,
					404: noBidResponseSchema,
				},
				tags: ["adserver"],
				summary: "Process bid request from bid adapter",
				description:
					"Filters line items by size, geo, adType, CPM range and frequency capping. Returns best matching line item with highest CPM.",
			},
		},
		controller.handleBid,
	);
}
