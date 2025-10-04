import type { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";
import { DEFAULT_FEED_URL } from "../../../constants/feed";
import * as feedRepo from "../repository/feed.repository";
import type {
	FeedMeta,
	NormalizedFeed,
	NormalizedFeedItem,
} from "../types/feed.types";
import type { RssFeed, RssItem } from "../types/parser.types";

//one parser instance (generics → parseURL returns RssFeed)
// const parser: Parser<RssFeed, RssItem> = new Parser();
const parser: Parser<RssFeed, RssItem> = new Parser({
    requestOptions: {
        headers: {
            'User-Agent': process.env.FEED_UA ?? 'Mozilla/5.0 (compatible; InternNSBot/1.0; +https://example.com)',
            'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
        },
        // типи rss-parser це не завжди мають, тому можна підказати TS:
        // @ts-expect-error: redirect option is accepted by the underlying client
        redirect: 'follow',
        timeout: 10000,
    },
});






//  undefined → null
const toNull = (v?: string): string | null => v ?? null;

const resolveUrl = (url?: string) => (url?.trim() ? url : DEFAULT_FEED_URL);

const normalize = (feed: RssFeed, sourceUrl: string): NormalizedFeed => {
	const items: NormalizedFeedItem[] = (feed.items ?? []).map((it) => ({
		title: toNull(it.title),
		link: toNull(it.link),
		isoDate: toNull(it.isoDate),
		pubDate: toNull(it.pubDate),
		description: toNull(
			it.contentSnippet ?? it.content ?? it.summary ?? it.description,
		),
	}));

	const origin = new URL(sourceUrl);

	const meta: FeedMeta = {
		title: feed.title ?? origin.host,
		link: feed.link ?? origin.origin,
		description: toNull(feed.description),
		language: toNull(feed.language),
		lastUpdated: toNull(feed.lastBuildDate),
		image: feed.image?.url ?? null,
	};
	return { sourceUrl, meta, items };
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
