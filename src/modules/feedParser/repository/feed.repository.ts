import prisma from "../../../lib/prisma";
import type { NormalizedFeedItem } from "../types/feed.types";

export const feedRepository = {
    async findCacheBySourceUrl(sourceUrl: string) {
        return prisma.feedCache.findUnique({ where: { sourceUrl } });
    },

    async upsertCache(sourceUrl: string, items: NormalizedFeedItem[]) {
        return prisma.feedCache.upsert({
            where: { sourceUrl },
            create: { sourceUrl, items: items as any },
            update: { items: items as any },
        });
    },
};
