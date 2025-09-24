import * as cheerio from "cheerio";
import { isStaticEnough } from "../utils/isStaticEnough";

export async function parseArticle(url: string, force = false) {
	// Check if URL points to a file we can't parse
	const fileExtensions = /\.(pdf|mp4|mp3|zip|rar|7z|docx?)($|\?)/i;
	if (fileExtensions.test(url)) {
		throw { code: "PARSING_FAILED", message: "Not an HTML page" };
	}

	// Download the webpage
	const response = await fetch(url, {
		headers: {
			"user-agent": "Mozilla/5.0 (compatible; ArticleParser/1.0)",
			accept: "text/html,application/xhtml+xml",
		},
		redirect: "follow",
	});

	// Check if download was successful
	if (!response.ok) {
		throw { code: "FETCH_FAILED", message: `Failed to fetch ${url}` };
	}

	// Check if we got HTML content
	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("text/html")) {
		throw {
			code: "PARSING_FAILED",
			message: `Unsupported content-type: ${contentType}`,
		};
	}

	// Get the HTML text
	const html = await response.text();

	// Check if website is simple enough to parse (unless forced)
	if (!force) {
		const staticCheck = isStaticEnough(html);
		if (!staticCheck.ok) {
			const errorMessage = staticCheck.reasons.join("; ");
			throw { code: "UNSUPPORTED_SITE", message: errorMessage };
		}
	}

	// Load HTML into cheerio for parsing
	const $ = cheerio.load(html);

	// Find the article title
	let title = "";

	// Try Open Graph title first
	const ogTitle = $('meta[property="og:title"]').attr("content");
	if (ogTitle) {
		title = ogTitle;
	} else {
		// Try first H1 tag
		const h1Title = $("h1").first().text().trim();
		if (h1Title) {
			title = h1Title;
		} else {
			// Try page title
			const pageTitle = $("title").first().text().trim();
			title = pageTitle || "Untitled";
		}
	}

	// Find the author
	let author: string | null = null;

	const metaAuthor = $('meta[name="author"]').attr("content");
	if (metaAuthor) {
		author = metaAuthor;
	} else {
		const itempropAuthor = $('[itemprop="author"]').first().text().trim();
		if (itempropAuthor) {
			author = itempropAuthor;
		}
	}

	// Find publication date
	let publishedAt: string | null = null;

	const timeDateTime = $("time[datetime]").attr("datetime");
	if (timeDateTime) {
		publishedAt = timeDateTime;
	} else {
		const itempropDate = $('[itemprop="datePublished"]').attr("content");
		if (itempropDate) {
			publishedAt = itempropDate;
		}
	}

	// Function to make relative URLs absolute
	function makeAbsoluteUrl(href: string): string {
		return new URL(href, url).toString();
	}

	// Find the main content
	let content = "No content";

	// First try to find content in main sections
	const mainSections = $('[role="main"], main, article').first();
	if (mainSections.length > 0) {
		const paragraphs: string[] = [];
		mainSections.find("p").each((_index, element) => {
			const text = $(element).text().trim();
			if (text && paragraphs.length < 12) {
				paragraphs.push(text);
			}
		});

		if (paragraphs.length > 0) {
			content = paragraphs.join("\n\n");
		}
	}

	// If no main content found, try all paragraphs
	if (content === "No content") {
		const allParagraphs: string[] = [];
		$("p").each((_index, element) => {
			const text = $(element).text().trim();
			if (text && allParagraphs.length < 6) {
				allParagraphs.push(text);
			}
		});

		if (allParagraphs.length > 0) {
			content = allParagraphs.join("\n\n");
		}
	}

	// Find all images
	const imageUrls: string[] = [];
	$("img[src]").each((_index, element) => {
		const src = $(element).attr("src");
		if (src) {
			const absoluteUrl = makeAbsoluteUrl(src);
			if (!imageUrls.includes(absoluteUrl)) {
				imageUrls.push(absoluteUrl);
			}
		}
	});

	// Find all links
	const linkUrls: string[] = [];
	$("a[href]").each((_index, element) => {
		const href = $(element).attr("href");
		if (href) {
			// Skip internal page links and javascript links
			if (!href.startsWith("#") && !href.startsWith("javascript:")) {
				const absoluteUrl = makeAbsoluteUrl(href);
				if (!linkUrls.includes(absoluteUrl)) {
					linkUrls.push(absoluteUrl);
				}
			}
		}
	});

	// Return the parsed data
	return {
		sourceUrl: url,
		title,
		author,
		publishedAt,
		content,
		images: imageUrls,
		links: linkUrls,
	};
}
