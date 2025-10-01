// src/modules/analytics/repository/analytics.repository.ts

import type { FastifyInstance } from 'fastify';

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

interface EventFilters {
    startDate?: Date;
    endDate?: Date;
    bidder?: string;
    limit?: number;
}

interface SummaryFilters {
    startDate?: Date;
    endDate?: Date;
}

export interface AnalyticsRepo {
    insertEvents: (events: AuctionEvent[]) => Promise<void>;
    getEvents: (filters: EventFilters) => Promise<any[]>;
    getSummary: (filters: SummaryFilters) => Promise<any[]>;
}

export function createAnalyticsRepo(fastify: FastifyInstance): AnalyticsRepo {
    const clickhouse = fastify.clickhouse;

    return {
        insertEvents: async (events: AuctionEvent[]): Promise<void> => {
            await clickhouse.insert({
                table: 'auction_events',
                values: events,
                format: 'JSONEachRow',
            });
        },

        getEvents: async (filters: EventFilters): Promise<any[]> => {
            const whereConditions: string[] = [];

            if (filters.startDate) {
                whereConditions.push(`timestamp >= '${filters.startDate.toISOString()}'`);
            }
            if (filters.endDate) {
                whereConditions.push(`timestamp <= '${filters.endDate.toISOString()}'`);
            }
            if (filters.bidder) {
                whereConditions.push(`bidder = '${filters.bidder}'`);
            }

            const whereClause = whereConditions.length > 0
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

            const query = `
                SELECT *
                FROM auction_events
                ${whereClause}
                ORDER BY timestamp DESC
                LIMIT ${filters.limit || 100}
            `;

            const result = await clickhouse.query({
                query,
                format: 'JSONEachRow',
            });

            return await result.json();
        },

        getSummary: async (filters: SummaryFilters): Promise<any[]> => {
            const whereConditions: string[] = [];

            if (filters.startDate) {
                whereConditions.push(`timestamp >= '${filters.startDate.toISOString()}'`);
            }
            if (filters.endDate) {
                whereConditions.push(`timestamp <= '${filters.endDate.toISOString()}'`);
            }

            const whereClause = whereConditions.length > 0
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';

            const query = `
                SELECT
                    bidder,
                    count() as total_bids,
                    sum(is_winner) as wins,
                    avg(bid_cpm) as avg_cpm,
                    max(bid_cpm) as max_cpm
                FROM auction_events
                ${whereClause}
                GROUP BY bidder
                ORDER BY total_bids DESC
            `;

            const result = await clickhouse.query({
                query,
                format: 'JSONEachRow',
            });

            return await result.json();
        },
    };
}