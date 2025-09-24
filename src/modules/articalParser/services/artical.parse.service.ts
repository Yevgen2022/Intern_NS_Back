// services/artical.parse.service.ts
import * as cheerio from "cheerio";
import { isStaticEnough } from "../utils/isStaticEnough"; // як раніше

export async function parseArticle(url: string, force = false) {
    if (/\.(pdf|mp4|mp3|zip|rar|7z|docx?)($|\?)/i.test(url)) {
        throw { code: "PARSING_FAILED", message: "Not an HTML page" };
    }

    const res = await fetch(url, {
        headers: {
            "user-agent": "Mozilla/5.0 (compatible; ArticleParser/1.0)",
            "accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
    });
    if (!res.ok) throw { code: "FETCH_FAILED", message: `Failed to fetch ${url}` };

    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("text/html")) {
        throw { code: "PARSING_FAILED", message: `Unsupported content-type: ${ctype}` };
    }

    const html = await res.text();
    if (!force) {
        const stat = isStaticEnough(html);
        if (!stat.ok) throw { code: "UNSUPPORTED_SITE", message: stat.reasons.join("; ") };
    }

    const $ = cheerio.load(html);

    const title =
        $('meta[property="og:title"]').attr("content") ||
        $("h1").first().text().trim() ||
        $("title").first().text().trim() ||
        "Untitled";

    const author =
        $('meta[name="author"]').attr("content") ||
        $('[itemprop="author"]').first().text().trim() ||
        null;

    const publishedAt =
        $("time[datetime]").attr("datetime") ||
        $('[itemprop="datePublished"]').attr("content") ||
        null;

    const toAbs = (href: string) => new URL(href, url).toString();

    const content =
        ($('[role="main"], main, article').first().find("p").toArray()
            .map(p => $(p).text().trim()).filter(Boolean).slice(0, 12).join("\n\n"))
        || ($("p").slice(0, 6).toArray()
            .map(p => $(p).text().trim()).filter(Boolean).join("\n\n"))
        || "No content";

    const images = Array.from(new Set(
        $("img[src]").toArray()
            .map(el => $(el).attr("src")!).filter(Boolean).map(toAbs)
    ));
    const links = Array.from(new Set(
        $("a[href]").toArray()
            .map(el => $(el).attr("href")!).filter(Boolean)
            .filter(h => !h.startsWith("#") && !h.startsWith("javascript:"))
            .map(toAbs)
    ));

    return { sourceUrl: url, title, author, publishedAt, content, images, links };
}
