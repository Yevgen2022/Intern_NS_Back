// // Schema for the request body when parsing an article
//
// const HTTP_URL_PATTERN = "^https?:\\/\\/\\S+$" as const;
//
//
// export const parseArticleBody = {
// 	type: "object",
// 	required: ["url"],
// 	properties: {
// 		url: {
// 			type: "string",
// 			minLength: 8, // Minimum URL length like "http://a"
// 			maxLength: 4096, // Maximum reasonable URL length
// 			pattern: HTTP_URL_PATTERN,
// 		},
// 		// Option to force parsing even for dynamic websites
// 		force: {
// 			type: "boolean",
// 			default: false,
// 		},
// 	},
// 	additionalProperties: false, // Don't allow extra fields
// };
//
// // Schema for the response when article parsing is successful
// export const parseArticleResponse = {
// 	type: "object",
// 	properties: {
// 		// The original URL that was parsed
// 		sourceUrl: {
// 			type: "string",
// 			pattern: "HTTP_URL_PATTERN",
// 		},
//
// 		// Article title (always required)
// 		title: {
// 			type: "string",
// 		},
//
// 		// Author name (can be null if not found)
// 		author: {
// 			type: ["string", "null"],
// 		},
//
// 		// Publication date (can be null if not found)
// 		publishedAt: {
// 			anyOf: [
// 				{ type: "string", format: "date-time" }, // ISO date format
// 				{ type: "null" }, // or null if not found
// 			],
// 		},
//
// 		// Main article content (always required)
// 		content: {
// 			type: "string",
// 		},
//
// 		// Array of image URLs found in the article
// 		images: {
// 			type: "array",
// 			items: {
// 				type: "string",
// 				pattern: "HTTP_URL_PATTERN",
// 			},
// 			uniqueItems: true, // No duplicate URLs
// 		},
//
// 		// Array of link URLs found in the article
// 		links: {
// 			type: "array",
// 			items: {
// 				type: "string",
// 				pattern: "^https?:HTTP_URL_PATTERN",
// 			},
// 			uniqueItems: true, // No duplicate URLs
// 		},
// 	},
//
// 	// These fields must always be present in the response
// 	required: ["sourceUrl", "title", "content"],
//
// 	// Don't allow extra fields in the response
// 	additionalProperties: false,
// };

// Schema for the request body when parsing an article

const HTTP_URL_PATTERN = "^https?:\\/\\/\\S+$" as const;

export const parseArticleBody = {
	type: "object",
	required: ["url"],
	properties: {
		url: {
			type: "string",
			minLength: 8, // Minimum URL length like "http://a"
			maxLength: 4096, // Maximum reasonable URL length
			pattern: HTTP_URL_PATTERN,
			examples: [
				"https://tsn.ua/tsikavinki/naystarishyy-cholovik-svitu-rozkryv-sekret-dovholittia-skilky-yomu-rokiv-2928602.html",
			],
		},
		force: {
			type: "boolean",
			default: false,
			examples: [false],
		},
	},
	additionalProperties: false, // Don't allow extra fields

	examples: [
		{
			url: "https://tsn.ua/tsikavinki/naystarishyy-cholovik-svitu-rozkryv-sekret-dovholittia-skilky-yomu-rokiv-2928602.html",
			force: false,
		},
	],
} as const;

// Schema for the response when article parsing is successful
export const parseArticleResponse = {
	type: "object",
	properties: {
		sourceUrl: {
			type: "string",
			pattern: HTTP_URL_PATTERN,
			examples: [
				"https://tsn.ua/tsikavinki/naystarishyy-cholovik-svitu-rozkryv-sekret-dovholittia-skilky-yomu-rokiv-2928602.html",
			],
		},

		title: {
			type: "string",
			examples: ["У Києві відкрили новий міст через Дніпро"],
		},

		author: {
			type: ["string", "null"],
			examples: ["ТСН.ua"],
		},

		publishedAt: {
			anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
			examples: ["2025-10-07T06:30:00.000Z"],
		},

		content: {
			type: "string",
			examples: [
				"Новий міст з’єднає лівий та правий береги столиці, скоротивши час у дорозі на 15 хвилин. На відкритті були присутні представники місцевої влади та жителі Києва...",
			],
		},

		images: {
			type: "array",
			items: {
				type: "string",
				pattern: HTTP_URL_PATTERN,
			},
			uniqueItems: true,
			examples: [
				[
					"https://tsn.ua/img/2025/10/07/mist-kyiv-cover.jpg",
					"https://tsn.ua/img/2025/10/07/mist-kyiv-panorama.jpg",
				],
			],
		},

		links: {
			type: "array",
			items: {
				type: "string",
				pattern: HTTP_URL_PATTERN,
			},
			uniqueItems: true,
			examples: [["https://tsn.ua/kyiv", "https://tsn.ua/tag/mist"]],
		},
	},

	required: ["sourceUrl", "title", "content"],
	additionalProperties: false,

	example: {
		sourceUrl:
			"https://tsn.ua/tsikavinki/naystarishyy-cholovik-svitu-rozkryv-sekret-dovholittia-skilky-yomu-rokiv-2928602.html",
		title: "У Києві відкрили новий міст через Дніпро",
		author: "ТСН.ua",
		publishedAt: "2025-10-07T06:30:00.000Z",
		content:
			"Новий міст з’єднає лівий та правий береги столиці, скоротивши час у дорозі на 15 хвилин. На відкритті були присутні представники місцевої влади та жителі Києва...",
		images: [
			"https://tsn.ua/img/2025/10/07/mist-kyiv-cover.jpg",
			"https://tsn.ua/img/2025/10/07/mist-kyiv-panorama.jpg",
		],
		links: ["https://tsn.ua/kyiv", "https://tsn.ua/tag/mist"],
	},
} as const;
