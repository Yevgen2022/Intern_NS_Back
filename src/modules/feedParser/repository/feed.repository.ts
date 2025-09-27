import type { PrismaClient } from "@prisma/client";
import type { NormalizedFeedItem } from "../types/feed.types";

export async function findCache(prisma: PrismaClient, sourceUrl: string) {
	return prisma.feed.findUnique({ where: { sourceUrl } });
}

export async function upsertCache(
	prisma: PrismaClient,
	sourceUrl: string,
	items: NormalizedFeedItem[],
) {
	return prisma.feed.upsert({
		where: { sourceUrl },
		create: { sourceUrl, items },
		update: { items },
	});
}

export async function findAllSources(prisma: PrismaClient): Promise<string[]> {
	const sources = await prisma.feed.findMany({ select: { sourceUrl: true } });
	return sources.map((s) => s.sourceUrl);
}
