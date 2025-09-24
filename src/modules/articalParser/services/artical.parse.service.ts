// modules/articalParser/services/artical.parse.service.ts
import * as cheerio from "cheerio";

export async function parseArticle(url: string) {
    const res = await fetch(url, {
        headers: {
            "user-agent": "Mozilla/5.0 (compatible; ArticleParser/1.0)",
            "accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
    });
    if (!res.ok) throw { code: "FETCH_FAILED", message: `Failed to fetch ${url}` };

    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("text/html")) throw { code: "PARSING_FAILED", message: "Not an HTML page" };

    const html = await res.text();

    // 🔎 Дуже прості евристики SPA/SSR
    const looksLikeSpa =
        /id="__next"|id="root"|id="app"/i.test(html) ||               // Next/Vue/React корінь
        /<script[^>]+type="application\/json"[^>]*>/.test(html) ||    // великі JSON-дампи
        (html.match(/<script\b/gi)?.length || 0) > 40;                // забагато скриптів

    if (looksLikeSpa) throw { code: "UNSUPPORTED_SITE" };

    const $ = cheerio.load(html);

    const title =
        $("meta[property='og:title']").attr("content") ||
        $("h1").first().text().trim() ||
        $("title").first().text().trim() ||
        "Untitled";

    const author =
        $("meta[name='author']").attr("content") ||
        $('[itemprop="author"]').first().text().trim() ||
        null;

    const publishedAt =
        $("time[datetime]").attr("datetime") ||
        $('[itemprop="datePublished"]').attr("content") ||
        null;

    const content =
        // спроба взяти основний текст
        $('[role="main"], main, article')
            .first()
            .find("p")
            .toArray()
            .map((p) => $(p).text().trim())
            .filter(Boolean)
            .slice(0, 12)
            .join("\n\n") || $("p").slice(0, 6).toArray().map((p) => $(p).text().trim()).filter(Boolean).join("\n\n") || "No content";

    const toAbs = (href: string) => new URL(href, url).toString();

    const images = $("img[src]")
        .toArray()
        .map((el) => $(el).attr("src")!)
        .filter(Boolean)
        .map(toAbs);

    const links = $("a[href]")
        .toArray()
        .map((el) => $(el).attr("href")!)
        .filter(Boolean)
        .filter((h) => !h.startsWith("#") && !h.startsWith("javascript:"))
        .map(toAbs);

    return { sourceUrl: url, title, author, publishedAt, content, images, links };
}
