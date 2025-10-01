// src/modules/analytics/services/analytics.service.ts

import type { FastifyInstance } from 'fastify';
import type { AnalyticsRepo } from '../repository/analytics.repository';

interface AuctionEvent {
    event_id: string;
    event_type: string;
    timestamp: Date;
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

export interface AnalyticsService {
    saveEvent: (event: AuctionEvent) => Promise<void>;
    getEvents: (filters: any) => Promise<any[]>;
    getSummary: (filters: any) => Promise<any[]>;
    forceFlush: () => Promise<void>;
    shutdown: () => Promise<void>;
}

export function createAnalyticsService(
    fastify: FastifyInstance,
    repository: AnalyticsRepo
): AnalyticsService {
    let eventQueue: AuctionEvent[] = [];
    const BATCH_SIZE = 100;
    const FLUSH_INTERVAL = 30000;
    let flushTimer: NodeJS.Timeout | null = null;
    let isFlushing = false;

    fastify.log.info('Analytics Service: Creating new instance');

    // Запуск таймера
    const startFlushTimer = () => {
        if (flushTimer) {
            fastify.log.warn('Analytics: Clearing existing timer');
            clearInterval(flushTimer);
        }

        flushTimer = setInterval(() => {
            fastify.log.info(`Analytics Timer: Triggered (queue size: ${eventQueue.length})`);
            flushEvents();
        }, FLUSH_INTERVAL);

        fastify.log.info(`Analytics Timer: Started with ${FLUSH_INTERVAL / 1000}s interval, batch size: ${BATCH_SIZE}`);
    };

    // Запис подій в БД
    const flushEvents = async (): Promise<void> => {
        if (isFlushing) {
            fastify.log.warn('Analytics Flush: Already in progress - skipping');
            return;
        }

        if (eventQueue.length === 0) {
            fastify.log.debug('Analytics Flush: Queue empty - skipping');
            return;
        }

        isFlushing = true;

        const eventsToFlush = [...eventQueue];
        eventQueue = [];

        fastify.log.info(`Analytics Flush: Starting - ${eventsToFlush.length} events from queue`);

        try {
            await repository.insertEvents(eventsToFlush);
            fastify.log.info(`Analytics Flush: SUCCESS - ${eventsToFlush.length} events written to ClickHouse`);
        } catch (error: any) {
            fastify.log.error(`Analytics Flush: FAILED - ${error.message}`);
            eventQueue.unshift(...eventsToFlush);
            fastify.log.warn(`Analytics Flush: Restored ${eventsToFlush.length} events back to queue`);
        } finally {
            isFlushing = false;
            fastify.log.debug(`Analytics Flush: Completed (queue now: ${eventQueue.length})`);
        }
    };

    // Ініціалізація
    startFlushTimer();

    return {
        saveEvent: async (event: AuctionEvent): Promise<void> => {
            eventQueue.push(event);
            fastify.log.info(`Analytics Queue: Added event (queue: ${eventQueue.length}/${BATCH_SIZE}, event_id: ${event.event_id})`);

            if (eventQueue.length >= BATCH_SIZE) {
                fastify.log.info('Analytics Queue: BATCH SIZE REACHED - triggering flush');
                await flushEvents();
            }
        },

        getEvents: async (filters: any): Promise<any[]> => {
            fastify.log.info('Analytics: Fetching events with filters', filters);
            return await repository.getEvents(filters);
        },

        getSummary: async (filters: any): Promise<any[]> => {
            fastify.log.info('Analytics: Fetching summary with filters', filters);
            return await repository.getSummary(filters);
        },

        forceFlush: async (): Promise<void> => {
            fastify.log.info('Analytics: Force flush requested');
            await flushEvents();
        },

        shutdown: async (): Promise<void> => {
            fastify.log.info('Analytics Shutdown: Starting...');
            if (flushTimer) {
                clearInterval(flushTimer);
                fastify.log.info('Analytics Shutdown: Timer cleared');
            }
            await flushEvents();
            fastify.log.info('Analytics Shutdown: Complete');
        },
    };
}