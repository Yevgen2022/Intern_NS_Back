import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { analyticsService } from "../services/analytics.services";
import type {
	EventBody,
	EventFilters,
	QueryParams,
	SummaryFilters,
} from "../types/analytics.types";

export function analyticsController(fastify: FastifyInstance) {
	fastify.addHook("onClose", async (app) => {
		await analyticsService.shutdown(app);
	});

	return {
		saveEvent: async (
			request: FastifyRequest<{ Body: EventBody }>,
			reply: FastifyReply,
		) => {
			try {
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

		getEvents: async (
			request: FastifyRequest<{ Querystring: QueryParams }>,
			reply: FastifyReply,
		) => {
			try {
				const { startDate, endDate, bidder, limit } = request.query;

				const start = startDate ? new Date(startDate) : undefined;
				const end = endDate ? new Date(endDate) : undefined;

				if (start && Number.isNaN(start.getTime())) {
					throw fastify.httpErrors.badRequest("Invalid startDate");
				}
				if (end && Number.isNaN(end.getTime())) {
					throw fastify.httpErrors.badRequest("Invalid endDate");
				}
				if (start && end && start > end) {
					throw fastify.httpErrors.badRequest("startDate must be <= endDate");
				}

				let lim = 100;
				if (limit !== undefined) {
					const n = parseInt(limit, 10);
					if (!Number.isFinite(n) || n <= 0) {
						throw fastify.httpErrors.badRequest("Invalid limit");
					}
					lim = n;
				}

				const filters: EventFilters = {
					startDate: start,
					endDate: end,
					bidder,
					limit: lim,
				};

				const events = await analyticsService.getEvents(fastify, filters);

				return reply.send({
					success: true,
					data: events,
					count: events.length,
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

		getSummary: async (
			request: FastifyRequest<{ Querystring: QueryParams }>,
			reply: FastifyReply,
		) => {
			try {
				const { startDate, endDate } = request.query;

				const start = startDate ? new Date(startDate) : undefined;
				const end = endDate ? new Date(endDate) : undefined;

				if (start && Number.isNaN(start.getTime())) {
					throw fastify.httpErrors.badRequest("Invalid startDate");
				}
				if (end && Number.isNaN(end.getTime())) {
					throw fastify.httpErrors.badRequest("Invalid endDate");
				}
				if (start && end && start > end) {
					throw fastify.httpErrors.badRequest("startDate must be <= endDate");
				}

				const filters: SummaryFilters = { startDate: start, endDate: end };
				const summary = await analyticsService.getSummary(fastify, filters);

				return reply.send({
					success: true,
					data: summary,
				});
			} catch (err) {
				const error = err as Error & { code?: string; statusCode?: number };
				if (error?.statusCode) throw err;

				if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND") {
					throw fastify.httpErrors.badGateway("ClickHouse connection failed.");
				}

				fastify.log.error({ err }, "getSummary failed");
				throw fastify.httpErrors.internalServerError(
					error?.message || "Internal Server Error",
				);
			}
		},
	};
}
