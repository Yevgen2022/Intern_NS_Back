import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { analyticsController } from "../controllers/analytics.controllers";
import { getSummarySchema, } from "../schemas/analytics.scemas";

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
	route.get(
		"/events",
		{
			schema: {
                tags: ["analytics"],
                summary: "Get auction events",
                description:
                    "Retrieves auction events with optional filters: startDate, endDate, bidder, limit.",
                querystring: {
                    type: "object",
                    properties: {
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                        bidder: { type: "string", minLength: 1, maxLength: 255 },
                        limit: { type: "integer", minimum: 1, maximum: 1000, default: 100 },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        required: ["success", "data"],
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: [
                                        "timestamp",
                                        "bidder",
                                        "bid_cpm",
                                        "min_cpm",
                                        "max_cpm",
                                        "is_winner",
                                        "auction_id",
                                    ],
                                    properties: {
                                        timestamp: { type: "string" },
                                        bidder: { type: "string" },
                                        bid_cpm: { type: "number" },
                                        min_cpm: { type: "number" },
                                        max_cpm: { type: "number" },
                                        is_winner: { type: "integer" },
                                        auction_id: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
			},
		},
		controller.getEvents,
	);

	// GET /api/analytics/summary - get aggregated statistics
	route.get(
		"/summary",
		{
			schema: getSummarySchema,

		},
		controller.getSummary,
	);
}

