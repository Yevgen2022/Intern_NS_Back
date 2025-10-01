import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from 'fastify';
import { analyticsController } from '../controllers/analytics.controllers';

export async function analyticsRoutes(fastify: FastifyInstance) {
    const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
    const controller = analyticsController(fastify);

    // POST /api/analytics/events - save auction event
    route.post(
        '/events',
        {
            schema: {
                tags: ['analytics'],
                summary: 'Save auction event',
                description: 'Adds auction event to batch queue. Events are written to ClickHouse in batches of 100 or every 30 seconds.',
            },
        },
        controller.saveEvent
    );

    // GET /api/analytics/events - get events with filters
    route.get(
        '/events',
        {
            schema: {
                tags: ['analytics'],
                summary: 'Get auction events',
                description: 'Retrieves auction events with optional filters: startDate, endDate, bidder, limit.',
                querystring: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                        bidder: { type: 'string' },
                        limit: { type: 'integer', default: 100 },
                    },
                },
            },
        },
        controller.getEvents
    );

    // GET /api/analytics/summary - get aggregated statistics
    route.get(
        '/summary',
        {
            schema: {
                tags: ['analytics'],
                summary: 'Get aggregated statistics',
                description: 'Returns aggregated stats by bidder: total bids, wins, avg CPM, max CPM.',
                querystring: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        controller.getSummary
    );
}