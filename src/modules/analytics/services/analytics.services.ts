import type { FastifyInstance } from "fastify";
import { analyticsRepository } from "../repository/analytics.repository";
import type {
	AuctionEvent,
	EventFilters,
	EventRow,
	SummaryFilters,
	SummaryRow,
} from "../types/analytics.types";

const kState = Symbol("analyticsState");

type ServiceState = {
	eventQueue: AuctionEvent[];
	flushTimer: NodeJS.Timeout | null;
	isFlushing: boolean;
	totalProcessed: number;
	flushCount: number;
};

const BATCH_SIZE = 100;
const FLUSH_INTERVAL = 30_000;

function ensureState(fastify: FastifyInstance): ServiceState {
	// @ts-expect-error
	if (!fastify[kState]) {
		fastify.log.info("Analytics: Initializing state");
		// @ts-expect-error
		fastify[kState] = {
			eventQueue: [],
			flushTimer: null,
			isFlushing: false,
			totalProcessed: 0,
			flushCount: 0,
		} as ServiceState;
		startFlushTimer(fastify);
		fastify.log.info(
			`Analytics Timer: Started (${FLUSH_INTERVAL / 1000}s interval, batch=${BATCH_SIZE})`,
		);
	}
	// @ts-expect-error
	return fastify[kState] as ServiceState;
}

function startFlushTimer(fastify: FastifyInstance) {
	const state = ensureState(fastify);
	if (state.flushTimer) {
		fastify.log.warn("Analytics: Clearing existing timer");
		clearInterval(state.flushTimer);
	}
	state.flushTimer = setInterval(() => {
		fastify.log.info(
			`Analytics Timer: Triggered (queue: ${state.eventQueue.length})`,
		);
		void flushEvents(fastify);
	}, FLUSH_INTERVAL);
}

async function flushEvents(fastify: FastifyInstance): Promise<void> {
	const state = ensureState(fastify);

	if (state.isFlushing) {
		fastify.log.warn("Analytics Flush: Already in progress - skipping");
		return;
	}

	if (state.eventQueue.length === 0) {
		fastify.log.debug("Analytics Flush: Queue empty - skipping");
		return;
	}

	state.isFlushing = true;
	state.flushCount++;

	const eventsToFlush = [...state.eventQueue];
	state.eventQueue = [];

	fastify.log.info(
		`Analytics Flush #${state.flushCount}: Starting (${eventsToFlush.length} events)`,
	);
	const startTime = Date.now();

	try {
		await analyticsRepository.insertEvents(fastify, eventsToFlush);
		const duration = Date.now() - startTime;
		state.totalProcessed += eventsToFlush.length;

		fastify.log.info(
			`Analytics Flush #${state.flushCount}: SUCCESS - ${eventsToFlush.length} events written (${duration}ms, total: ${state.totalProcessed})`,
		);
	} catch (err) {
		const duration = Date.now() - startTime;
		fastify.log.error(
			{ err },
			`Analytics Flush #${state.flushCount}: FAILED (${duration}ms) - restoring ${eventsToFlush.length} events to queue`,
		);
		state.eventQueue.unshift(...eventsToFlush);
	} finally {
		state.isFlushing = false;
		fastify.log.debug(
			`Analytics Flush: Completed (queue now: ${state.eventQueue.length})`,
		);
	}
}

export const analyticsService = {
	saveEvent: async (
		fastify: FastifyInstance,
		event: AuctionEvent,
	): Promise<void> => {
		const state = ensureState(fastify);
		const queueBefore = state.eventQueue.length;
		state.eventQueue.push(event);

		fastify.log.info(
			`Analytics Queue: Event added (${queueBefore} → ${state.eventQueue.length}/${BATCH_SIZE}, id: ${event.event_id})`,
		);

		if (state.eventQueue.length >= BATCH_SIZE) {
			fastify.log.info("Analytics Queue: BATCH SIZE REACHED - flushing");
			await flushEvents(fastify);
		}
	},

	getEvents: async (
		fastify: FastifyInstance,
		filters: EventFilters,
	): Promise<EventRow[]> => {
		fastify.log.info({ filters }, "Analytics: Fetching events");
		const result = await analyticsRepository.getEvents(fastify, filters);
		fastify.log.info(`Analytics: Found ${result.length} events`);
		return result;
	},

	getSummary: async (
		fastify: FastifyInstance,
		filters: SummaryFilters,
	): Promise<SummaryRow[]> => {
		fastify.log.info({ filters }, "Analytics: Fetching summary");
		const result = await analyticsRepository.getSummary(fastify, filters);
		fastify.log.info(`Analytics: Summary generated (${result.length} rows)`);
		return result;
	},

	shutdown: async (fastify: FastifyInstance): Promise<void> => {
		const state = ensureState(fastify);
		fastify.log.info(
			`Analytics Shutdown: Starting (queue: ${state.eventQueue.length}, total processed: ${state.totalProcessed})`,
		);

		if (state.flushTimer) {
			clearInterval(state.flushTimer);
			fastify.log.info("Analytics Shutdown: Timer cleared");
		}

		await flushEvents(fastify);
		fastify.log.info(
			`Analytics Shutdown: Complete (${state.flushCount} total flushes)`,
		);
	},
};
