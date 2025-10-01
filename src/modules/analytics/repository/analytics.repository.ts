// import type { FastifyInstance } from "fastify";
// import type {
// 	AuctionEvent,
// 	EventFilters,
// 	EventRow,
// 	SummaryFilters,
// 	SummaryRow,
// } from "../types/analytics.types";
//
// export const analyticsRepository = {
// 	insertEvents: async (
// 		fastify: FastifyInstance,
// 		events: AuctionEvent[],
// 	): Promise<void> => {
// 		await fastify.clickhouse.insert({
// 			table: "auction_events",
// 			values: events,
// 			format: "JSONEachRow",
// 		});
// 	},
//
// 	getEvents: async (
// 		fastify: FastifyInstance,
// 		filters: EventFilters,
// 	): Promise<EventRow[]> => {
// 		const clickhouse = fastify.clickhouse;
// 		const where: string[] = [];
//
// 		if (filters.startDate)
// 			where.push(`timestamp >= '${filters.startDate.toISOString()}'`);
// 		if (filters.endDate)
// 			where.push(`timestamp <= '${filters.endDate.toISOString()}'`);
// 		if (filters.bidder) where.push(`bidder = '${filters.bidder}'`);
//
// 		const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
//
// 		const query = `
//             SELECT *
//             FROM auction_events
//             ${whereClause}
//             ORDER BY timestamp DESC
//             LIMIT ${filters.limit || 100}
//         `;
//
// 		const result = await clickhouse.query({
// 			query,
// 			format: "JSONEachRow",
// 		});
//
// 		const data = await result.json();
// 		return data as EventRow[];
// 	},
//
// 	getSummary: async (
// 		fastify: FastifyInstance,
// 		filters: SummaryFilters,
// 	): Promise<SummaryRow[]> => {
// 		const clickhouse = fastify.clickhouse;
// 		const where: string[] = [];
//
// 		if (filters.startDate)
// 			where.push(`timestamp >= '${filters.startDate.toISOString()}'`);
// 		if (filters.endDate)
// 			where.push(`timestamp <= '${filters.endDate.toISOString()}'`);
//
// 		const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
//
// 		const query = `
//             SELECT
//                 bidder,
//                 count() as total_bids,
//                 sum(is_winner) as wins,
//                 avg(bid_cpm) as avg_cpm,
//                 max(bid_cpm) as max_cpm
//             FROM auction_events
//                      ${whereClause}
//             GROUP BY bidder
//             ORDER BY total_bids DESC
//         `;
//
// 		const result = await clickhouse.query({
// 			query,
// 			format: "JSONEachRow",
// 		});
//
// 		const data = await result.json(); // First we get the data
// 		return data as SummaryRow[]; // Then we reduce to the type
// 	},
// };

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
		const queryParams: Record<string, unknown> = {};

		if (filters.startDate) {
			where.push("timestamp >= {startDate: DateTime}");
			queryParams.startDate = filters.startDate
				.toISOString()
				.replace("T", " ")
				.replace("Z", "");
		}

		if (filters.endDate) {
			where.push("timestamp <= {endDate: DateTime}");
			queryParams.endDate = filters.endDate
				.toISOString()
				.replace("T", " ")
				.replace("Z", "");
		}

		if (filters.bidder) {
			where.push("bidder = {bidder: String}");
			queryParams.bidder = filters.bidder;
		}

		const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

		// Limit завжди присутній (за замовчуванням 100)
		queryParams.limit = filters.limit || 100;

		const query = `
            SELECT *
            FROM auction_events
            ${whereClause}
            ORDER BY timestamp DESC
            LIMIT {limit: UInt32}
        `;

		const result = await clickhouse.query({
			query,
			query_params: queryParams,
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
		const queryParams: Record<string, unknown> = {};

		if (filters.startDate) {
			where.push("timestamp >= {startDate: DateTime}");
			queryParams.startDate = filters.startDate
				.toISOString()
				.replace("T", " ")
				.replace("Z", "");
		}

		if (filters.endDate) {
			where.push("timestamp <= {endDate: DateTime}");
			queryParams.endDate = filters.endDate
				.toISOString()
				.replace("T", " ")
				.replace("Z", "");
		}

		const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

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
			query_params: queryParams,
			format: "JSONEachRow",
		});

		const data = await result.json();
		return data as SummaryRow[];
	},
};
