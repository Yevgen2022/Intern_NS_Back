import type { Prisma, PrismaClient } from "@prisma/client";
import type { FeedMeta, NormalizedFeedItem } from "../types/feed.types";

export async function findCache(prisma: PrismaClient, sourceUrl: string) {
	const row = await prisma.feed.findUnique({
		where: { sourceUrl },
		select: { meta: true, items: true },
	});
	if (!row) return null;

	return {
		meta: row.meta as FeedMeta,
		items: row.items as NormalizedFeedItem[],
	};
}

// export async function upsertCache(
// 	prisma: PrismaClient,
// 	sourceUrl: string,
// 	meta: FeedMeta,
// 	items: NormalizedFeedItem[],
// ) {
// 	if (meta == null || typeof meta !== "object") {
// 		throw new Error("upsertCache: meta is null/undefined");
// 	}
//
// 	const metaJson = meta as Prisma.InputJsonValue;
// 	const itemsJson = items as Prisma.InputJsonValue;
//
// 	return prisma.feed.upsert({
// 		where: { sourceUrl },
// 		create: { sourceUrl, meta: metaJson, items: itemsJson },
// 		update: { meta: metaJson, items: itemsJson },
// 	});
// }

export async function upsertCache(
    prisma: PrismaClient,
    sourceUrl: string,
    meta: FeedMeta,
    items: NormalizedFeedItem[],
) {
    if (meta == null || typeof meta !== "object") {
        throw new Error("upsertCache: meta is null/undefined");
    }

    const metaJson = meta as Prisma.InputJsonValue;
    const itemsJson = items as Prisma.InputJsonValue;

    // Checking if the record exists
    const existingFeed = await prisma.feed.findUnique({
        where: { sourceUrl },
    });

    if (existingFeed) {
        // If it exists, update it.
        return prisma.feed.update({
            where: { sourceUrl },
            data: { meta: metaJson, items: itemsJson },
        });
    } else {
        // If it doesn't exist, create it.
        return prisma.feed.create({
            data: { sourceUrl, meta: metaJson, items: itemsJson },
        });
    }
}


export async function findAllSources(prisma: PrismaClient): Promise<string[]> {
	const sources = await prisma.feed.findMany({ select: { sourceUrl: true } });
	return sources.map((s) => s.sourceUrl);
}
