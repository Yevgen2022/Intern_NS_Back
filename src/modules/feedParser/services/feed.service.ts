import type {PrismaClient} from "@prisma/client";
import Parser from "rss-parser";
import {DEFAULT_FEED_URL} from "../../../constants/feed";
import * as feedRepo from "../repository/feed.repository";
import type {FeedMeta, NormalizedFeed, NormalizedFeedItem} from "../types/feed.types";

// one parser instance
const parser = new Parser();

// local types for the parser
type RssItem = {
    title?: string;
    link?: string;
    isoDate?: string;
    pubDate?: string;
    contentSnippet?: string;
    content?: string;
    summary?: string;
    description?: string;
};

const resolveUrl = (url?: string) => (url?.trim() ? url : DEFAULT_FEED_URL);

const normalize = (feed: any, sourceUrl: string): NormalizedFeed => {

    const items: NormalizedFeedItem[] = (feed.items ?? []).map((it: RssItem) => ({
        title: it.title,
        link: it.link,
        isoDate: it.isoDate,
        pubDate: it.pubDate,
        description:
            it.contentSnippet ?? it.content ?? it.summary ?? it.description,
    }));

    const meta: FeedMeta = {
        title: feed.title ?? new URL(sourceUrl).host,
        link: feed.link ?? new URL(sourceUrl).origin,
        description: feed.description ?? null,
        language: feed.language ?? null,
        lastUpdated: feed.lastBuildDate ?? null,
        image: feed.image?.url ?? null,
    };
    return {sourceUrl, meta, items};
};


//only parsing (without DB)
export async function parseFeed(url?: string): Promise<NormalizedFeed> {
    const sourceUrl = resolveUrl(url);
    const raw = await parser.parseURL(sourceUrl);
    return normalize(raw, sourceUrl);
}

export async function getFeed(
    prisma: PrismaClient,
    url?: string,
    force = false,
): Promise<NormalizedFeed> {

    const sourceUrl = resolveUrl(url);

    if (!force) {
        const cached = await feedRepo.findCache(prisma, sourceUrl);
        if (cached) {
            // cache hit: return the stored value
            return {
                sourceUrl,
                meta: cached.meta,
                items: cached.items,
            };
        }
    }


    const parsed = await parseFeed(sourceUrl);

    try {
        // saving meta + items
        await feedRepo.upsertCache(prisma, sourceUrl, parsed.meta, parsed.items);
    } catch (e) {
        console.error(e);
    }

    return parsed;
}


