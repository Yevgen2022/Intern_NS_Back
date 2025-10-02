import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { analyticsController } from "../controllers/analytics.controllers";
import { getEventsSchema, getSummarySchema } from "../schemas/analytics.scemas";

export async function analyticsRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
	const controller = analyticsController(fastify);

	// POST /api/analytics/events - save auction event
	route.post(
		"/events",
		{
			schema: {
				tags: ["analytics"],
				summary: "Save auction event",
				description:
					"Adds auction event to batch queue. Events are written to ClickHouse in batches of 100 or every 30 seconds.",
			},
		},
		controller.saveEvent,
	);

	// GET /api/analytics/events - get events with filters
	route.get("/events", { schema: getEventsSchema }, controller.getEvents);

	// GET /api/analytics/summary - get aggregated statistics
	//This route returns aggregated statistics by bidders
	// (how many bids, how many wins, average CPM, etc.)
	route.get(
		"/summary",
		{
			schema: getSummarySchema,
		},
		controller.getSummary,
	);
}
