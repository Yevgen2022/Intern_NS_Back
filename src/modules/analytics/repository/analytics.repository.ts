import type { FastifyInstance } from "fastify";
import type {
	AuctionEvent,
	EventFilters,
	EventRow,
	SummaryFilters,
	SummaryRow,
} from "../types/analytics.types";

type ClickHouseParam = string | number | boolean;
const TABLE = "auction_events";

export const analyticsRepository = {
	insertEvents: async (
		fastify: FastifyInstance,
		events: AuctionEvent[],
	): Promise<void> => {
		await fastify.clickhouse.insert({
			table: TABLE,
			values: events,
			format: "JSONEachRow",
		});
	},

	getEvents: async (
		fastify: FastifyInstance,
		q: EventFilters,
	): Promise<EventRow[]> => {
		const clickhouse = fastify.clickhouse;
		const params: Record<string, ClickHouseParam> = {};
		const where: string[] = ["1"]; // always true

		// dates
		if (q.startDate) {
			where.push(`timestamp >= parseDateTimeBestEffort({start:String})`);
			params.start = q.startDate.toISOString();
		}
		if (q.endDate) {
			where.push(`timestamp <  parseDateTimeBestEffort({end:String})`);
			params.end = q.endDate.toISOString();
		}

		// simple filters
		if (q.event_type) {
			where.push(`event_type = {event_type:String}`);
			params.event_type = q.event_type;
		}
		if (q.bidder) {
			where.push(`bidder = {bidder:String}`);
			params.bidder = q.bidder;
		}
		if (q.ad_unit_code) {
			where.push(`ad_unit_code = {ad_unit_code:String}`);
			params.ad_unit_code = q.ad_unit_code;
		}
		if (q.ad_unit_size) {
			where.push(`ad_unit_size = {ad_unit_size:String}`);
			params.ad_unit_size = q.ad_unit_size;
		}
		if (q.bid_currency) {
			where.push(`bid_currency = {bid_currency:String}`);
			params.bid_currency = q.bid_currency;
		}
		if (q.device_type) {
			where.push(`device_type = {device_type:String}`);
			params.device_type = q.device_type;
		}
		if (q.browser) {
			where.push(`browser = {browser:String}`);
			params.browser = q.browser;
		}
		if (q.os) {
			where.push(`os = {os:String}`);
			params.os = q.os;
		}
		if (q.geo_country) {
			where.push(`geo_country = {geo_country:String}`);
			params.geo_country = q.geo_country;
		}
		if (q.geo_city) {
			where.push(`geo_city = {geo_city:String}`);
			params.geo_city = q.geo_city;
		}
		if (q.campaign_id) {
			where.push(`campaign_id = {campaign_id:String}`);
			params.campaign_id = q.campaign_id;
		}
		if (q.creative_id) {
			where.push(`creative_id = {creative_id:String}`);
			params.creative_id = q.creative_id;
		}

		// Boolean victory filter
		if (q.is_winner === "0" || q.is_winner === "1") {
			where.push(`is_winner = {is_winner:UInt8}`);
			params.is_winner = Number(q.is_winner);
		}

		// range CPM
		if (q.min_cpm) {
			const n = Number(q.min_cpm);
			if (!Number.isNaN(n)) {
				where.push(`bid_cpm >= {min_cpm:Float64}`);
				params.min_cpm = n;
			}
		}
		if (q.max_cpm) {
			const n = Number(q.max_cpm);
			if (!Number.isNaN(n)) {
				where.push(`bid_cpm <= {max_cpm:Float64}`);
				params.max_cpm = n;
			}
		}

		// pagination and sorting (values ​​are already normalized in the controller/service)
		const limit = q.limit ?? 100;
		const offset = q.offset ?? 0;
		const orderBy = q.order_by || "timestamp";
		const orderDir =
			(q.order_dir || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";

		params.limit = limit;
		params.offset = offset;

		const sql = `
      SELECT
        timestamp,
        bidder,
        bid_cpm,
        is_winner,
        auction_id,
        event_type,
        ad_unit_code,
        bid_currency,
        creative_id,
        ad_unit_size,
        page_url
      FROM ${TABLE}
      WHERE ${where.join(" AND ")}
      ORDER BY ${orderBy} ${orderDir}
      LIMIT {limit:UInt32} OFFSET {offset:UInt32}
    `;

		const rs = await clickhouse.query({
			query: sql,
			format: "JSONEachRow",
			query_params: params,
		});
		const data = await rs.json();
		return data as EventRow[];
	},

	getSummary: async (
		fastify: FastifyInstance,
		filters: SummaryFilters,
	): Promise<SummaryRow[]> => {
		const clickhouse = fastify.clickhouse;
		const params: Record<string, ClickHouseParam> = {};
		const where: string[] = ["1"];

		if (filters.startDate) {
			where.push(`timestamp >= parseDateTimeBestEffort({start:String})`);
			params.start = filters.startDate.toISOString();
		}
		if (filters.endDate) {
			where.push(`timestamp <  parseDateTimeBestEffort({end:String})`);
			params.end = filters.endDate.toISOString();
		}
		if (filters.bidder) {
			where.push(`bidder = {bidder:String}`);
			params.bidder = filters.bidder;
		}

		const sql = `
      SELECT
        bidder,
        count()                AS total_bids,
        sum(is_winner)         AS wins,
        round(avg(bid_cpm), 2) AS avg_cpm,
        round(min(bid_cpm), 2) AS min_cpm,
        round(max(bid_cpm), 2) AS max_cpm
      FROM ${TABLE}
      WHERE ${where.join(" AND ")}
      GROUP BY bidder
      ORDER BY total_bids DESC
    `;

		const rs = await clickhouse.query({
			query: sql,
			format: "JSONEachRow",
			query_params: params,
		});
		const data = await rs.json();
		return data as SummaryRow[];
	},
};
