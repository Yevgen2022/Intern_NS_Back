import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { analyticsService } from "../services/analytics.services";
import type {
	EventBody,
	EventFilters,
	QueryParams,
	SummaryFilters,
} from "../types/analytics.types";

export function analyticsController(fastify: FastifyInstance) {
	// I'm waiting for the server to close down - I'm waiting for the queue to flush
	fastify.addHook("onClose", async (app) => {
		await analyticsService.shutdown(app);
	});

	return {
		// POST /events — I just put it in the queue, and the service itself will decide when to flush it.
		saveEvent: async (
			request: FastifyRequest<{ Body: EventBody }>,
			reply: FastifyReply,
		) => {
			try {
				// I put the timestamp here so that the database has a DateTime
				const eventData = { ...request.body, timestamp: new Date() };
				await analyticsService.saveEvent(fastify, eventData);

				return reply.code(201).send({
					success: true,
					message: "Event saved successfully",
				});
			} catch (err) {
				const error = err as Error & { code?: string };
				if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND") {
					throw fastify.httpErrors.badGateway("ClickHouse connection failed.");
				}
				fastify.log.error({ err }, "saveEvent failed");
				throw fastify.httpErrors.internalServerError(
					error?.message || "Internal Server Error",
				);
			}
		},

		// GET /events — universal: view=raw | view=summary
		getEvents: async (
			request: FastifyRequest<{ Querystring: QueryParams }>,
			reply: FastifyReply,
		) => {
			try {
				const {
					startDate,
					endDate,
					bidder, // the most frequent
					// other filters:
					event_type,
					ad_unit_code,
					ad_unit_size,
					is_winner,
					min_cpm,
					max_cpm,
					bid_currency,
					device_type,
					browser,
					os,
					geo_country,
					geo_city,
					campaign_id,
					creative_id,
					limit,
					offset,
					order_by,
					order_dir,
					view, // "raw" | "summary"
				} = request.query;

				// date validation
				const start = startDate ? new Date(startDate) : undefined;
				const end = endDate ? new Date(endDate) : undefined;
				if (start && Number.isNaN(start.getTime()))
					throw fastify.httpErrors.badRequest("Invalid startDate");
				if (end && Number.isNaN(end.getTime()))
					throw fastify.httpErrors.badRequest("Invalid endDate");
				if (start && end && start > end)
					throw fastify.httpErrors.badRequest("startDate must be <= endDate");

				//  parse numeric parameters
				const lim =
					limit !== undefined
						? Math.min(Math.max(parseInt(String(limit), 10) || 100, 1), 1000)
						: 100;
				const off =
					offset !== undefined
						? Math.max(parseInt(String(offset), 10) || 0, 0)
						: 0;
				const ordBy = order_by || "timestamp";
				const ordDir =
					(order_dir || "desc").toLowerCase() === "asc" ? "asc" : "desc";

				// If view=summary — we immediately go along the aggregation branch
				if ((view || "raw") === "summary") {
					const filters: SummaryFilters = {
						startDate: start,
						endDate: end,
						bidder,
					};
					const summary = await analyticsService.getSummary(fastify, filters);
					return reply.send({ success: true, data: summary });
				}

				// view=raw — collect all filters into one object
				const filters: EventFilters = {
					startDate: start,
					endDate: end,
					bidder,
					event_type,
					ad_unit_code,
					ad_unit_size,
					is_winner,
					min_cpm,
					max_cpm,
					bid_currency,
					device_type,
					browser,
					os,
					geo_country,
					geo_city,
					campaign_id,
					creative_id,
					limit: lim,
					offset: off,
					order_by: ordBy,
					order_dir: ordDir,
				};

				const events = await analyticsService.getEvents(fastify, filters);
				return reply.send({
					success: true,
					data: events,
					count: events.length,
					limit: lim,
					offset: off,
				});
			} catch (err) {
				const error = err as Error & { code?: string; statusCode?: number };
				if (error?.statusCode) throw err;
				if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND") {
					throw fastify.httpErrors.badGateway("ClickHouse connection failed.");
				}
				fastify.log.error({ err }, "getEvents failed");
				throw fastify.httpErrors.internalServerError(
					error?.message || "Internal Server Error",
				);
			}
		},
	};
}
