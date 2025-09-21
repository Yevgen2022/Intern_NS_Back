import type { PrismaClient } from "@prisma/client";
import type { NormalizedFeedItem } from "../types/feed.types";

export async function findCache(prisma: PrismaClient, sourceUrl: string) {
	return prisma.feedCache.findUnique({ where: { sourceUrl } });
}

export async function upsertCache(
	prisma: PrismaClient,
	sourceUrl: string,
	items: NormalizedFeedItem[],
) {
	return prisma.feedCache.upsert({
		where: { sourceUrl },
		create: { sourceUrl, items },
		update: { items },
	});
}
