import type { ClickHouseClient } from '@clickhouse/client';

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

class AnalyticsService {
    private eventQueue: AuctionEvent[] = [];
    private readonly BATCH_SIZE = 100;
    private readonly FLUSH_INTERVAL = 30000;
    private flushTimer: NodeJS.Timeout | null = null;
    private clickhouseClient: ClickHouseClient | null = null; // ✅ ДОДАНО

    // ✅ ДОДАНО метод initialize
    initialize(client: ClickHouseClient) {
        this.clickhouseClient = client;
        this.startFlushTimer();
    }

    private startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flushEvents();
        }, this.FLUSH_INTERVAL);
    }

    async saveEvent(event: AuctionEvent): Promise<void> {
        this.eventQueue.push(event);
        console.log(`📊 В черзі: ${this.eventQueue.length} подій`);

        if (this.eventQueue.length >= this.BATCH_SIZE) {
            await this.flushEvents();
        }
    }

    private async flushEvents(): Promise<void> {
        if (this.eventQueue.length === 0 || !this.clickhouseClient) return; // ✅ ДОДАНО перевірку

        const eventsToFlush = [...this.eventQueue];
        this.eventQueue = [];

        try {
            await this.clickhouseClient.insert({
                table: 'auction_events',
                values: eventsToFlush,
                format: 'JSONEachRow',
            });

            console.log(`✅ Записано ${eventsToFlush.length} подій в ClickHouse`);
        } catch (error: any) {
            console.error('❌ Помилка запису подій:', error.message);
            this.eventQueue.unshift(...eventsToFlush);
        }
    }

    async getEvents(filters: {
        startDate?: Date;
        endDate?: Date;
        bidder?: string;
        limit?: number;
    }): Promise<any[]> {
        if (!this.clickhouseClient) throw new Error('ClickHouse not initialized'); // ✅ ДОДАНО

        let whereConditions: string[] = [];

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

        const result = await this.clickhouseClient.query({
            query,
            format: 'JSONEachRow',
        });

        return await result.json();
    }

    async getSummary(filters: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<any> {
        if (!this.clickhouseClient) throw new Error('ClickHouse not initialized'); // ✅ ДОДАНО

        let whereConditions: string[] = [];

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

        const result = await this.clickhouseClient.query({
            query,
            format: 'JSONEachRow',
        });

        return await result.json();
    }

    async forceFlush(): Promise<void> {
        await this.flushEvents();
    }
}

export default new AnalyticsService();