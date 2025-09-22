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

// modules/feedParser/repository/feed.repository.ts
//This code is for bypassing the replica

// import type { PrismaClient } from "@prisma/client";
// import type { NormalizedFeedItem } from "../types/feed.types";
//
// export async function findCache(prisma: PrismaClient, sourceUrl: string) {
// 	return prisma.feed.findUnique({ where: { sourceUrl } });
// }
//
// // Emulation of upsert without transactions (works without replica set) Have problem with mongo
// export async function upsertCache(
// 	prisma: PrismaClient,
// 	sourceUrl: string,
// 	items: NormalizedFeedItem[],
// ) {
// 	const updated = await prisma.feed.updateMany({
// 		where: { sourceUrl },
// 		data: { items },
// 	});
//
// 	if (updated.count > 0) {
// 		return prisma.feed.findUnique({ where: { sourceUrl } });
// 	}
//
// 	try {
// 		return await prisma.feed.create({ data: { sourceUrl, items } });
// 	} catch (e: any) {
// 		//If you have already created the same sourceUrl in parallel
// 		if (e?.code === "P2002") {
// 			return prisma.feed.update({ where: { sourceUrl }, data: { items } });
// 		}
// 		throw e;
// 	}
// }
