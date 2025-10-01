// src/modules/analytics/controllers/analytics.controllers.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import analyticsService from '../services/analytics.services';

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

class AnalyticsController {
    async saveEventController(
        request: FastifyRequest<{ Body: EventBody }>,
        reply: FastifyReply
    ) {
        try {
            const eventData = {
                ...request.body,
                timestamp: new Date(),
            };

            await analyticsService.saveEvent(eventData);

            return reply.code(201).send({
                success: true,
                message: 'Event saved successfully',
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                error: error.message,
            });
        }
    }

    async getEventsController(
        request: FastifyRequest<{ Querystring: QueryParams }>,
        reply: FastifyReply
    ) {
        try {
            const { startDate, endDate, bidder, limit } = request.query;

            const filters = {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                bidder,
                limit: limit ? parseInt(limit) : 100,
            };

            const events = await analyticsService.getEvents(filters);

            return reply.send({
                success: true,
                data: events,
                count: events.length,
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                error: error.message,
            });
        }
    }

    async getSummaryController(
        request: FastifyRequest<{ Querystring: QueryParams }>,
        reply: FastifyReply
    ) {
        try {
            const { startDate, endDate } = request.query;

            const filters = {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            };

            const summary = await analyticsService.getSummary(filters);

            return reply.send({
                success: true,
                data: summary,
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                error: error.message,
            });
        }
    }
}

export default new AnalyticsController();