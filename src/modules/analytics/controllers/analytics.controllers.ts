import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createAnalyticsService } from '../services/analytics.services';
import { createAnalyticsRepo } from '../repository/analytics.repository';

interface EventBody {
    event_id: string;
    event_type: string;
    auction_id: string;
    ad_unit_code: string;
    bidder: string;
    bid_cpm: number;
    bid_currency?: string;
    campaign_id?: string;
    creative?: string;
    geo_country?: string;
    geo_city?: string;
    device_type?: string;
    browser?: string;
    os?: string;
    is_winner: number;
    render_time?: number;
}

interface QueryParams {
    startDate?: string;
    endDate?: string;
    bidder?: string;
    limit?: string;
}

export function analyticsController(fastify: FastifyInstance) {

    // Створюємо repository → service всередині controller
    const repository = createAnalyticsRepo(fastify);
    const service = createAnalyticsService(fastify, repository);


    // Graceful shutdown
    fastify.addHook('onClose', async () => {
        await service.shutdown();
    });

    return {
        saveEvent: async (
            request: FastifyRequest<{ Body: EventBody }>,
            reply: FastifyReply
        ) => {
            try {
                const eventData = {
                    ...request.body,
                    timestamp: new Date(),
                };

                await service.saveEvent(eventData);

                return reply.code(201).send({
                    success: true,
                    message: 'Event saved successfully',
                });
            } catch (error: any) {
                request.log.error('Error saving event:', error);
                return reply.code(500).send({
                    success: false,
                    error: error.message,
                });
            }
        },

        getEvents: async (
            request: FastifyRequest<{ Querystring: QueryParams }>,
            reply: FastifyReply
        ) => {
            try {
                const { startDate, endDate, bidder, limit } = request.query;

                const filters = {
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    bidder,
                    limit: limit ? parseInt(limit) : 100,
                };

                const events = await service.getEvents(filters);

                return reply.send({
                    success: true,
                    data: events,
                    count: events.length,
                });
            } catch (error: any) {
                request.log.error('Error getting events:', error);
                return reply.code(500).send({
                    success: false,
                    error: error.message,
                });
            }
        },

        getSummary: async (
            request: FastifyRequest<{ Querystring: QueryParams }>,
            reply: FastifyReply
        ) => {
            try {
                const { startDate, endDate } = request.query;

                const filters = {
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                };

                const summary = await service.getSummary(filters);

                return reply.send({
                    success: true,
                    data: summary,
                });
            } catch (error: any) {
                request.log.error('Error getting summary:', error);
                return reply.code(500).send({
                    success: false,
                    error: error.message,
                });
            }
        },
    };
}