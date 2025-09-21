import Parser from "rss-parser";
import { feedRepository } from "../repository/feed.repository";
import type { NormalizedFeed, NormalizedFeedItem } from "../types/feed.types";

// Default feed URL (used when no `url` provided or it's empty/whitespace)
//export const DEFAULT_FEED_URL = "https://news.ycombinator.com/rss"
//export const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";
export const DEFAULT_FEED_URL ="https://www.nasa.gov/rss/dyn/breaking_news.rss";

// single parser instance
const parser = new Parser();

// resolve final URL (fallback to default)
const resolveUrl = (url?: string) =>
    url && url.trim() ? url : DEFAULT_FEED_URL;

// map raw feed into our normalized DTO
const normalize = (feed: any, sourceUrl: string): NormalizedFeed => {
    const items: NormalizedFeedItem[] = (feed.items || []).map((it: any) => ({
        title: it.title,
        link: it.link,
        isoDate: it.isoDate,
        pubDate: it.pubDate,
        description:
            it.contentSnippet ?? it.content ?? it.summary ?? it.description,
    }));
    return { sourceUrl, items };
};

// fetch & parse remote feed (no DB)
export async function parseFeed(url?: string): Promise<NormalizedFeed> {
    const sourceUrl = resolveUrl(url);
    const raw = await parser.parseURL(sourceUrl);
    return normalize(raw, sourceUrl);
}

// main entry for controller (with simple DB cache)
export async function getFeed(
    url?: string,
    force = false,
): Promise<NormalizedFeed> {
    const sourceUrl = resolveUrl(url);

    if (!force) {
        const cached = await feedRepository.findCacheBySourceUrl(sourceUrl);
        if (cached) {
            return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
        }
    }

    const fresh = await parseFeed(sourceUrl);
    await feedRepository.upsertCache(sourceUrl, fresh.items);
    return fresh;
}
