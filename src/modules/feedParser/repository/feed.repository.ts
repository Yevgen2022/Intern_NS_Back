import prisma from "../../../lib/prisma";
import type { NormalizedFeedItem } from "../types/feed.types";
import { Prisma } from "@prisma/client";

export const feedRepository = {
	findCacheBySourceUrl(sourceUrl: string) {
		return prisma.feedCache.findUnique({ where: { sourceUrl } });
	},

	upsertCache(sourceUrl: string, items: NormalizedFeedItem[]) {
		return prisma.feedCache.upsert({
			where: { sourceUrl },
			create: { sourceUrl, items: items as unknown as Prisma.InputJsonValue },
			update: { items: items as unknown as Prisma.InputJsonValue },
		});
	},
};
