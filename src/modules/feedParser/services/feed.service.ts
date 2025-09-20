// modules/feed/service.ts
import Parser from "rss-parser";

export const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";

export type NormalizedFeedItem = {
    title: string | undefined;
    link: string | undefined;
    isoDate?: string;
    pubDate?: string;
    description?: string;
};

export type NormalizedFeed = {
    sourceUrl: string;
    title?: string;
    lastBuildDate?: string;
    items: NormalizedFeedItem[];
};

class FeedService {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
    }

    /**
     * Parses an RSS/Atom feed by URL and returns normalized data.
     */
    async parseFeed(url: string): Promise<NormalizedFeed> {
        const sourceUrl = url || DEFAULT_FEED_URL;

        try {
            const feed = await this.parser.parseURL(sourceUrl);

            const items: NormalizedFeedItem[] = (feed.items || []).map((it) => ({
                title: it.title,
                link: it.link,
                // rss-parser returns either isoDate or pubDate (values ​​can be undefined)
                isoDate: (it as any).isoDate,
                pubDate: it.pubDate,
                description: it.contentSnippet ?? it.content ?? it.summary ?? it.description,
            }));

            return {
                sourceUrl,
                title: feed.title,
                lastBuildDate: (feed as any).lastBuildDate,
                items,
            };
        } catch (err: any) {
            // кlet's move on with a friendly message - the controller will turn this into a 5xx
            const msg = err?.message ?? "Unknown feed parsing error";
            throw new Error(`Feed parsing failed: ${msg}`);
        }
    }
}

export const feedService = new FeedService();
