// import type { PrismaClient } from "@prisma/client";
// import Parser from "rss-parser";
// import { DEFAULT_FEED_URL } from "../../../constants/feed";
// import * as feedRepo from "../repository/feed.repository";
// import type { NormalizedFeed, NormalizedFeedItem } from "../types/feed.types";
//
// // one parser instance
// const parser = new Parser();
//
// // local types for the parser
// type RssItem = {
// 	title?: string;
// 	link?: string;
// 	isoDate?: string;
// 	pubDate?: string;
// 	contentSnippet?: string;
// 	content?: string;
// 	summary?: string;
// 	description?: string;
// };
// type RssFeed = { items?: RssItem[] };
//
// const resolveUrl = (url?: string) => (url?.trim() ? url : DEFAULT_FEED_URL);
//
// const normalize = (feed: RssFeed, sourceUrl: string): NormalizedFeed => {
// 	const items: NormalizedFeedItem[] = (feed.items ?? []).map((it: RssItem) => ({
// 		title: it.title,
// 		link: it.link,
// 		isoDate: it.isoDate,
// 		pubDate: it.pubDate,
// 		description:
// 			it.contentSnippet ?? it.content ?? it.summary ?? it.description,
// 	}));
// 	return { sourceUrl, items };
// };
//
// //only parsing (without DB)
// export async function parseFeed(url?: string): Promise<NormalizedFeed> {
// 	const sourceUrl = resolveUrl(url);
// 	const raw = (await parser.parseURL(sourceUrl)) as RssFeed;
// 	return normalize(raw, sourceUrl);
// }
//
// //The main function of the service: takes prisma as the first argument
// export async function getFeed(
// 	prisma: PrismaClient,
// 	url?: string,
// 	force = false,
// ): Promise<NormalizedFeed> {
// 	const sourceUrl = resolveUrl(url); // no duplicate URL string
//
// 	if (!force) {
// 		const cached = await feedRepo.findCache(prisma, sourceUrl);
// 		if (cached) {
// 			// cached.items is now in NormalizedFeedItem[] format
// 			return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
// 		}
// 	}
//
// 	// pull and parse the real feed
// 	const parsed = await parseFeed(sourceUrl);
//
// 	try {
// 		// cache normalized items
// 		await feedRepo.upsertCache(prisma, sourceUrl, parsed.items);
// 	} catch (e) {
// 		console.error(e);
// 	}
// 	return parsed;
// }

//
// import type { PrismaClient } from "@prisma/client";
// import Parser from "rss-parser";
// import { DEFAULT_FEED_URL } from "../../../constants/feed";
// import * as feedRepo from "../repository/feed.repository";
// import type { NormalizedFeed, NormalizedFeedItem } from "../types/feed.types";
// import { normalizeHttpUrl } from "../../../helpers/normalizeHttpUrl"; // NEW: нормалізація URL
//
// // один інстанс парсера (можна лишити без опцій)
// const parser = new Parser();
//
// // локальні типи для парсера
// type RssItem = {
//     title?: string;
//     link?: string;
//     guid?: string; // NEW: інколи посилання лежить у guid
//     isoDate?: string;
//     pubDate?: string;
//     contentSnippet?: string;
//     content?: string;
//     summary?: string;
//     description?: string;
// };
// type RssFeed = {
//     items?: RssItem[];
//     link?: string; // NEW: базовий URL фіда для відносних лінків
// };
//
// const resolveUrl = (url?: string) => (url?.trim() ? url : DEFAULT_FEED_URL);
//
// // Нормалізація фіда: фільтруємо биті/урізані URL та перетворюємо на абсолютні http(s)
// const normalize = (feed: RssFeed, sourceUrl: string): NormalizedFeed => {
//     const base = feed.link || sourceUrl; // NEW: база для відносних лінків
//     const items: NormalizedFeedItem[] = [];
//     let skipped = 0; // NEW: лічильник пропущених елементів (для діагностики)
//
//     for (const it of feed.items ?? []) {
//         // NEW: беремо кандидат лінка з link або guid
//         const candidate = it.link ?? it.guid ?? "";
//         // NEW: нормалізуємо та перевіряємо URL (http/https, без “…” тощо)
//         const check = normalizeHttpUrl(candidate, base);
//         if (!check.ok) {
//             skipped++; // NEW: пропускаємо елемент з поганим URL
//             continue;
//         }
//
//         items.push({
//             title: it.title,
//             link: check.url, // NEW: вже нормалізований, абсолютний http(s)
//             isoDate: it.isoDate,
//             pubDate: it.pubDate,
//             description: it.contentSnippet ?? it.content ?? it.summary ?? it.description,
//         } as NormalizedFeedItem);
//     }
//
//     if (skipped) {
//         // NEW: легкий лог — можна прибрати або замінити на fastify.log
//         console.warn(`[feed] skipped ${skipped} items with invalid/truncated URLs for ${sourceUrl}`);
//     }
//
//     return { sourceUrl, items };
// };
//
// // Лише парсинг (без БД)
// export async function parseFeed(url?: string): Promise<NormalizedFeed> {
//     const sourceUrl = resolveUrl(url);
//     const raw = (await parser.parseURL(sourceUrl)) as RssFeed;
//     return normalize(raw, sourceUrl); // NEW: нормалізуємо тут
// }
//
// // Головна функція сервісу: бере prisma першим аргументом
// export async function getFeed(
//     prisma: PrismaClient,
//     url?: string,
//     force = false,
// ): Promise<NormalizedFeed> {
//     const sourceUrl = resolveUrl(url); // без дублювання URL-строки
//
//     if (!force) {
//         const cached = await feedRepo.findCache(prisma, sourceUrl);
//         if (cached) {
//             // cached.items вже у форматі NormalizedFeedItem[]
//             return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
//         }
//     }
//
//     // тягнемо і парсимо реальний фід (включно з нормалізацією лінків)
//     const parsed = await parseFeed(sourceUrl);
//
//     try {
//         // кешуємо нормалізовані items
//         await feedRepo.upsertCache(prisma, sourceUrl, parsed.items);
//     } catch (e) {
//         console.error(e);
//     }
//
//     return parsed;
// }


// feed.service.ts - ВИПРАВЛЕННЯ
import type { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";
import { DEFAULT_FEED_URL } from "../../../constants/feed";
import * as feedRepo from "../repository/feed.repository";
import type { NormalizedFeed, NormalizedFeedItem } from "../types/feed.types";
import { normalizeHttpUrl } from "../../../helpers/normalizeHttpUrl";

const parser = new Parser();

type RssItem = {
    title?: string;
    link?: string;
    guid?: string;
    isoDate?: string;
    pubDate?: string;
    contentSnippet?: string;
    content?: string;
    summary?: string;
    description?: string;
};

type RssFeed = {
    items?: RssItem[];
    link?: string;
};

const resolveUrl = (url?: string) => (url?.trim() ? url : DEFAULT_FEED_URL);

// ВИПРАВЛЕННЯ: Покращена нормалізація з детальнішою обробкою помилок
const normalize = (feed: RssFeed, sourceUrl: string): NormalizedFeed => {
    // ВИПРАВЛЕННЯ: Краща обробка base URL
    let base: string;
    try {
        // Спочатку намагаємося використати feed.link
        if (feed.link?.trim()) {
            const baseCheck = normalizeHttpUrl(feed.link);
            base = baseCheck.ok ? baseCheck.url : sourceUrl;
        } else {
            base = sourceUrl;
        }
    } catch {
        base = sourceUrl;
    }

    const items: NormalizedFeedItem[] = [];
    let skipped = 0;

    for (const it of feed.items ?? []) {
        // ВИПРАВЛЕННЯ: Кращий вибір кандидата для лінка
        let candidate = it.link?.trim();

        // Якщо link порожній або відсутній, пробуємо guid
        if (!candidate && it.guid?.trim()) {
            candidate = it.guid.trim();
        }

        // Якщо все ще немає кандидата, пропускаємо
        if (!candidate) {
            skipped++;
            continue;
        }

        const check = normalizeHttpUrl(candidate, base);
        if (!check.ok) {
            // ВИПРАВЛЕННЯ: Більш детальне логування для debug
            if (check.reason === "truncated_ellipsis") {
                console.warn(`[feed] ⚠️  TRUNCATED URL detected: "${candidate}"`);
                console.warn(`[feed]     This URL appears to be cut off and unusable`);
            } else {
                console.warn(`[feed] Invalid URL skipped: "${candidate}" - ${check.reason}`);
            }
            skipped++;
            continue;
        }

        // ВИПРАВЛЕННЯ: Кращий вибір опису з fallback
        const description = [
            it.contentSnippet,
            it.content,
            it.summary,
            it.description
        ].find(desc => desc?.trim())?.trim() || null;

        items.push({
            title: it.title?.trim() || null,
            link: check.url,
            isoDate: it.isoDate || null,
            pubDate: it.pubDate || null,
            description,
        } as NormalizedFeedItem);
    }

    if (skipped) {
        console.warn(`[feed] Skipped ${skipped} items with invalid URLs for ${sourceUrl}`);
    }

    return { sourceUrl, items };
};

export async function parseFeed(url?: string): Promise<NormalizedFeed> {
    const sourceUrl = resolveUrl(url);

    // ВИПРАВЛЕННЯ: Додаткова перевірка URL перед парсингом
    const urlCheck = normalizeHttpUrl(sourceUrl);
    if (!urlCheck.ok) {
        throw new Error(`Invalid feed URL: ${sourceUrl} - ${urlCheck.reason}`);
    }

    try {
        const raw = (await parser.parseURL(urlCheck.url)) as RssFeed;
        return normalize(raw, urlCheck.url);
    } catch (error) {
        throw new Error(`Failed to parse feed from ${sourceUrl}: ${error}`);
    }
}

export async function getFeed(
    prisma: PrismaClient,
    url?: string,
    force = false,
): Promise<NormalizedFeed> {
    const sourceUrl = resolveUrl(url);

    if (!force) {
        try {
            const cached = await feedRepo.findCache(prisma, sourceUrl);
            if (cached) {
                return { sourceUrl, items: cached.items as NormalizedFeedItem[] };
            }
        } catch (error) {
            console.warn(`Cache lookup failed for ${sourceUrl}:`, error);
            // Продовжуємо з парсингом навіть якщо кеш не працює
        }
    }

    const parsed = await parseFeed(sourceUrl);

    try {
        await feedRepo.upsertCache(prisma, sourceUrl, parsed.items);
    } catch (error) {
        console.error(`Failed to cache feed data for ${sourceUrl}:`, error);
        // Не кидаємо помилку, оскільки основні дані ми отримали
    }

    return parsed;
}