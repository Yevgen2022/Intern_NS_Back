import type { AdType } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { AdServerRepo } from "../services/adServer.services";
import type { LineItemWithCreative } from "../types/adServer.types";

// Creates a repository for working with line items and impression logs
// @param fastify - Fastify instance with access to Prisma

export function createAdServerRepo(fastify: FastifyInstance): AdServerRepo {
	const prisma = fastify.prisma;

	return {
		// Finds active line items with basic filtering
		// Filters by size, geo (array contains), adType, and status = active

		findActiveLineItems: async (filters: {
			size: string;
			geo: string;
			adType: string;
		}): Promise<LineItemWithCreative[]> => {
			const { size, geo, adType } = filters;

			// Query DB for line items with the provided filters
			const items = await prisma.lineItem.findMany({
				where: {
					status: "active", // only active
					size: size, // exact size match
					geo: {
						has: geo, // geo contains the required country (array contains)
					},
					adType: adType as AdType, // cast string to AdType enum
				},
				include: {
					creative: true, // include the full creative object
				},
			});

			// Map the result to the required shape
			return items.map((item) => ({
				id: item.id,
				size: item.size,
				cpmMin: item.cpmMin,
				cpmMax: item.cpmMax,
				geo: item.geo,
				adType: item.adType,
				frequency: item.frequency,
				creativeId: item.creativeId,
				creative: {
					url: item.creative.url,
				},
			}));
		},

		//   Checks frequency capping for a specific line item and user
		//   Counts how many times this line item was shown to this IP in the last 24 hours
		//
		//   @param lineItemId - line item ID
		//   @param userIp - user's IP address
		//   @param frequency - maximum number of impressions
		//   @returns true if it can be shown, false if the limit is exhausted

		checkFrequencyCapping: async (
			lineItemId: string,
			userIp: string,
			frequency: number,
		): Promise<boolean> => {
			// Count impressions for the last 24 hours
			const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

			const impressionCount = await prisma.impressionLog.count({
				where: {
					lineItemId: lineItemId,
					userIp: userIp,
					timestamp: {
						gte: oneDayAgo, // greater than or equal to 24 hours ago
					},
				},
			});

			// If the number of impressions is below the limit — can show
			return impressionCount < frequency;
		},

		//   Persists an ad impression
		//   Creates an impressionLog record for frequency capping

		saveImpression: async (
			lineItemId: string,
			userIp: string,
		): Promise<void> => {
			await prisma.impressionLog.create({
				data: {
					lineItemId: lineItemId,
					userIp: userIp,
					timestamp: new Date(), // current time
				},
			});
		},
	};
}
