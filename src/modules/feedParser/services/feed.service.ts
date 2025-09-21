// // Default feed URL (used when no `url` provided or it's empty/whitespace)
// //export const DEFAULT_FEED_URL = "https://news.ycombinator.com/rss"
// //export const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";
// export const DEFAULT_FEED_URL =
// 	"https://www.nasa.gov/rss/dyn/breaking_news.rss";

import type { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";
import * as feedRepo from "../repository/feed.repository";
import type { NormalizedFeed, NormalizedFeedItem } from "../types/feed.types";

export const DEFAULT_FEED_URL =
	"https://www.nasa.gov/rss/dyn/breaking_news.rss";

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
type RssFeed = { items?: RssItem[] };

const resolveUrl = (url?: string) => (url?.trim() ? url : DEFAULT_FEED_URL);

const normalize = (feed: RssFeed, sourceUrl: string): NormalizedFeed => {
	const items: NormalizedFeedItem[] = (feed.items ?? []).map((it: RssItem) => ({
		title: it.title,
		link: it.link,
		isoDate: it.isoDate,
		pubDate: it.pubDate,
		description:
			it.contentSnippet ?? it.content ?? it.summary ?? it.description,
	}));
	return { sourceUrl, items };
};

//only parsing (without DB)
export async function parseFeed(url?: string): Promise<NormalizedFeed> {
	const sourceUrl = resolveUrl(url);
	const raw = (await parser.parseURL(sourceUrl)) as RssFeed;
	return normalize(raw, sourceUrl);
}

//The main function of the service: takes prisma as the first argument
export async function getFeed(
	prisma: PrismaClient,
	url?: string,
	force = false,
): Promise<NormalizedFeed> {
	const sourceUrl = resolveUrl(url); // без дубля рядка URL

	if (!force) {
		const cached = await feedRepo.findCache(prisma, sourceUrl);
		if (cached) {
			// cached.items вже у форматі NormalizedFeedItem[]
			return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
		}
	}

	// pull and parse the real feed
	const parsed = await parseFeed(sourceUrl);

	// cache normalized items
	await feedRepo.upsertCache(prisma, sourceUrl, parsed.items);

	return parsed;
}
