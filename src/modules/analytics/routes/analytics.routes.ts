import { FastifyInstance } from 'fastify';
import controller from '../controllers/analytics.controllers';
import analyticsService from '../services/analytics.services';

const saveEventBody = {
    type: 'object',
    required: ['event_id', 'event_type', 'auction_id', 'ad_unit_code', 'bidder', 'bid_cpm', 'is_winner'],
    properties: {
        event_id: { type: 'string' },
        event_type: { type: 'string' },
        auction_id: { type: 'string' },
        ad_unit_code: { type: 'string' },
        bidder: { type: 'string' },
        bid_cpm: { type: 'number' },
        bid_currency: { type: 'string' },
        campaign_id: { type: 'string' },
        creative: { type: 'string' },
        geo_country: { type: 'string' },
        geo_city: { type: 'string' },
        device_type: { type: 'string' },
        browser: { type: 'string' },
        os: { type: 'string' },
        is_winner: { type: 'number' },
        render_time: { type: 'number' },
    },
} as const;

const saveEventResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
    },
} as const;

const getEventsResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: { type: 'array' },
        count: { type: 'number' },
    },
} as const;

export default async function analyticsRoutes(fastify: FastifyInstance) {
    // Ініціалізуємо сервіс з клієнтом
    analyticsService.initialize(fastify.clickhouse);

    const route = fastify;

    route.post(
        '/events',
        {
            schema: {
                body: saveEventBody,
                response: { 201: saveEventResponse },
            },
        },
        controller.saveEventController
    );

    route.get(
        '/events',
        {
            schema: {
                response: { 200: getEventsResponse },
            },
        },
        controller.getEventsController
    );

    route.get(
        '/summary',
        {
            schema: {
                response: { 200: getEventsResponse },
            },
        },
        controller.getSummaryController
    );
}