// // modules/feed/service.ts

import Parser from "rss-parser";
import  prisma  from "../../../lib/prisma";

export const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";

export type NormalizedFeedItem = {
    title?: string;
    link?: string;
    isoDate?: string;
    pubDate?: string;
    description?: string;
};

export type NormalizedFeed = {
    sourceUrl: string;
    items: NormalizedFeedItem[];
};

class FeedService {
    private parser = new Parser();

    private normalize(feed: any, sourceUrl: string): NormalizedFeed {
        const items: NormalizedFeedItem[] = (feed.items || []).map((it: any) => ({
            title: it.title,
            link: it.link,
            isoDate: it.isoDate,
            pubDate: it.pubDate,
            description:
                it.contentSnippet ?? it.content ?? it.summary ?? it.description,
        }));
        return { sourceUrl, items };
    }

    async parseFeed(url: string): Promise<NormalizedFeed> {
        const sourceUrl = url || DEFAULT_FEED_URL;
        const feed = await this.parser.parseURL(sourceUrl);
        return this.normalize(feed, sourceUrl);
    }

    async getFeed(sourceUrl: string, force = false): Promise<NormalizedFeed> {

        // 1) if not force — try from cache
        if (!force) {
            const cached = await prisma.feedCache.findUnique({
                where: { sourceUrl },
            });
            if (cached) {
                return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
            }
        }

        // 2) pull the feed and save it to the cache
        const fresh = await this.parseFeed(sourceUrl);
        await prisma.feedCache.upsert({
            where: { sourceUrl },
            create: { sourceUrl, items: fresh.items as any },
            update: { items: fresh.items as any },
        });
        return fresh;
    }
}

export const feedService = new FeedService();

