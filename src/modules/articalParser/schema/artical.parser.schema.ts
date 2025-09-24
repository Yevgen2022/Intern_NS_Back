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
		},
		// Option to force parsing even for dynamic websites
		force: {
			type: "boolean",
			default: false,
		},
	},
	additionalProperties: false, // Don't allow extra fields
};

// Schema for the response when article parsing is successful
export const parseArticleResponse = {
	type: "object",
	properties: {
		// The original URL that was parsed
		sourceUrl: {
			type: "string",
			pattern: "HTTP_URL_PATTERN",
		},

		// Article title (always required)
		title: {
			type: "string",
		},

		// Author name (can be null if not found)
		author: {
			type: ["string", "null"],
		},

		// Publication date (can be null if not found)
		publishedAt: {
			anyOf: [
				{ type: "string", format: "date-time" }, // ISO date format
				{ type: "null" }, // or null if not found
			],
		},

		// Main article content (always required)
		content: {
			type: "string",
		},

		// Array of image URLs found in the article
		images: {
			type: "array",
			items: {
				type: "string",
				pattern: "HTTP_URL_PATTERN",
			},
			uniqueItems: true, // No duplicate URLs
		},

		// Array of link URLs found in the article
		links: {
			type: "array",
			items: {
				type: "string",
				pattern: "^https?:HTTP_URL_PATTERN",
			},
			uniqueItems: true, // No duplicate URLs
		},
	},

	// These fields must always be present in the response
	required: ["sourceUrl", "title", "content"],

	// Don't allow extra fields in the response
	additionalProperties: false,
};
