// import Parser from "rss-parser";
// import { feedRepository } from "../repository/feed.repository";
// import type { NormalizedFeed, NormalizedFeedItem } from "../types/feed.types";
//
// export const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";
//
// class FeedService {
//     private parser = new Parser();
//
//     private normalize(feed: any, sourceUrl: string): NormalizedFeed {
//         const items: NormalizedFeedItem[] = (feed.items || []).map((it: any) => ({
//             title: it.title,
//             link: it.link,
//             isoDate: it.isoDate,
//             pubDate: it.pubDate,
//             description:
//                 it.contentSnippet ?? it.content ?? it.summary ?? it.description,
//         }));
//         return { sourceUrl, items };
//     }
//
//     async parseFeed(url: string): Promise<NormalizedFeed> {
//         const sourceUrl = url || DEFAULT_FEED_URL;
//         const feed = await this.parser.parseURL(sourceUrl);
//         return this.normalize(feed, sourceUrl);
//     }
//
//     async getFeed(sourceUrl: string, force = false): Promise<NormalizedFeed> {
//         if (!force) {
//             const cached = await feedRepository.findCacheBySourceUrl(sourceUrl);
//             if (cached) {
//                 return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
//             }
//         }
//
//         const fresh = await this.parseFeed(sourceUrl);
//         await feedRepository.upsertCache(sourceUrl, fresh.items);
//         return fresh;
//     }
// }
//
// export const feedService = new FeedService();



// modules/feed/services/feed.service.ts

import Parser from "rss-parser";
import { feedRepository } from "../repository/feed.repository";
import type { NormalizedFeed, NormalizedFeedItem } from "../types/feed.types";

// Default feed URL used when the caller does not provide a URL
//export const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";
export const DEFAULT_FEED_URL = "https://www.nasa.gov/rss/dyn/breaking_news.rss"
//export const DEFAULT_FEED_URL = "https://news.ycombinator.com/rss"






class FeedService {
    // Single Parser instance (rss-parser) to fetch/parse RSS/Atom feeds
    private parser = new Parser();

    /**
     * Convert the raw feed structure from rss-parser
     * into the app's normalized DTO shape (NormalizedFeed).
     * Keep only the fields the app actually needs.
     */
    private normalize(feed: any, sourceUrl: string): NormalizedFeed {
        const items: NormalizedFeedItem[] = (feed.items || []).map((it: any) => ({
            title: it.title,
            link: it.link,
            // rss-parser may provide isoDate and/or pubDate
            isoDate: it.isoDate,
            pubDate: it.pubDate,
            // prefer short text when available, fallback through possible fields
            description:
                it.contentSnippet ?? it.content ?? it.summary ?? it.description,
        }));

        return { sourceUrl, items };
    }

    /**
     * Fetch and parse a feed from a URL.
     * If url is falsy (undefined, empty string, etc.), fallback to DEFAULT_FEED_URL.
     * Returns a normalized structure for consistent downstream usage.
     */
    async parseFeed(url: string): Promise<NormalizedFeed> {
        const sourceUrl = url || DEFAULT_FEED_URL; // note: empty string will also fallback
        const feed = await this.parser.parseURL(sourceUrl);
        return this.normalize(feed, sourceUrl);
    }

    /**
     * Main entry point used by the controller.
     * - When force=false (default): try to serve from DB cache by sourceUrl.
     *   If found, return cached items immediately.
     * - Otherwise (no cache or force=true): fetch & parse the feed,
     *   upsert it into the cache, and return fresh data.
     */
    async getFeed(sourceUrl: string, force = false): Promise<NormalizedFeed> {
        if (!force) {
            const cached = await feedRepository.findCacheBySourceUrl(sourceUrl);
            if (cached) {
                return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
            }
        }

        // No cache or force=true → fetch fresh feed and store it
        const fresh = await this.parseFeed(sourceUrl);
        await feedRepository.upsertCache(sourceUrl, fresh.items);
        return fresh;
    }
}

// Singleton service instance used by the controller
export const feedService = new FeedService();
