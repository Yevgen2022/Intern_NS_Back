// import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
// import type { FastifyInstance } from "fastify";
// import { analyticsController } from "../controllers/analytics.controllers";
// import { getEventsSchema } from "../schemas/analytics.scemas";
//
// export async function analyticsRoutes(fastify: FastifyInstance) {
// 	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
// 	const controller = analyticsController(fastify);
//
// 	// 1) events: cache and flush in ClickHouse in batches
// 	route.post(
// 		"/events",
// 		{
// 			schema: {
// 				tags: ["analytics"],
// 				summary: "Save auction event",
// 				description:
// 					"Adds auction event to batch queue. Events are written to ClickHouse in batches of 100 or every 30 seconds.",
// 			},
// 		},
// 		controller.saveEvent,
// 	);
//
// 	// 2) The only read route.
// 	//    Depending on the `view` query parameter, returns either raw rows or a summary aggregation.
// 	route.get("/events", { schema: getEventsSchema }, controller.getEvents);
//
// 	// route.get("/summary", { schema: getSummaryOnlyForBackCompatSchema }, controller.getSummary);
// }

import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { analyticsController } from "../controllers/analytics.controllers";
import {
	errorSchema,
	getEventsSchema,
	saveEventBodySchema,
} from "../schemas/analytics.scemas";

export async function analyticsRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
	const controller = analyticsController(fastify);

	// 1) events: cache and flush in ClickHouse in batches
	route.post(
		"/events",
		{
			schema: {
				tags: ["analytics"],
				summary: "Save auction event",
				description:
					"Adds auction event to batch queue. Events are written to ClickHouse in batches of 100 or every 30 seconds.",
				body: saveEventBodySchema, //for swagger
				response: {
					200: {
						type: "object",
						additionalProperties: true,
						properties: {
							ok: { type: "boolean", examples: [true] },
							queued: { type: "boolean", examples: [true] },
						},
					},
					400: errorSchema,
					500: errorSchema,
				},
			},
		},
		controller.saveEvent,
	);

	// 2) read route
	route.get("/events", { schema: getEventsSchema }, controller.getEvents);
}
