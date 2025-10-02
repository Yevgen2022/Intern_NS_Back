import type { FastifyInstance } from "fastify";
import type {
	AuctionEvent,
	EventFilters,
	EventRow,
	SummaryFilters,
	SummaryRow,
} from "../types/analytics.types";

export const analyticsRepository = {
	insertEvents: async (
		fastify: FastifyInstance,
		events: AuctionEvent[],
	): Promise<void> => {
		await fastify.clickhouse.insert({
			table: "auction_events",
			values: events,
			format: "JSONEachRow",
		});
	},

	getEvents: async (
		fastify: FastifyInstance,
		filters: EventFilters,
	): Promise<EventRow[]> => {
		const clickhouse = fastify.clickhouse;
		const where: string[] = [];

		if (filters.startDate) {
			const startDateStr = filters.startDate
				.toISOString()
				.slice(0, 19)
				.replace("T", " ");
			where.push(`timestamp >= toDateTime('${startDateStr}')`);
		}

		if (filters.endDate) {
			const endDateStr = filters.endDate
				.toISOString()
				.slice(0, 19)
				.replace("T", " ");
			where.push(`timestamp <= toDateTime('${endDateStr}')`);
		}

		if (filters.bidder) {
			where.push(`bidder = '${filters.bidder}'`);
		}

		const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
		const limit = filters.limit || 100;

		const query = `
        SELECT *
        FROM auction_events
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ${limit}
    `;

		const result = await clickhouse.query({
			query,
			format: "JSONEachRow",
		});

		const data = await result.json();
		return data as EventRow[];
	},

	getSummary: async (
		fastify: FastifyInstance,
		filters: SummaryFilters,
	): Promise<SummaryRow[]> => {
		const clickhouse = fastify.clickhouse;
		const where: string[] = [];

		if (filters.startDate) {
			const startDateStr = filters.startDate
				.toISOString()
				.slice(0, 19)
				.replace("T", " ");
			where.push(`timestamp >= toDateTime('${startDateStr}')`);
		}

		if (filters.endDate) {
			const endDateStr = filters.endDate
				.toISOString()
				.slice(0, 19)
				.replace("T", " ");
			where.push(`timestamp <= toDateTime('${endDateStr}')`);
		}

		if (filters.bidder) {
			where.push(`bidder = '${filters.bidder}'`);
		}

		const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

		const query = `
        SELECT
            bidder,
            count() as total_bids,
            sum(is_winner) as wins,
            round(avg(bid_cpm), 2) as avg_cpm,
            round(min(bid_cpm), 2) as min_cpm,
            round(max(bid_cpm), 2) as max_cpm
        FROM auction_events
        ${whereClause}
        GROUP BY bidder
        ORDER BY total_bids DESC
    `;

		const result = await clickhouse.query({
			query,
			format: "JSONEachRow",
		});

		const data = await result.json();
		return data as SummaryRow[];
	},
};
