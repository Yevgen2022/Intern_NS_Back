export const schema = {
	tags: ["feed"],
	summary: "Get feed data (meta + items)",

	// query parameters
	querystring: {
		type: "object",
		properties: {
			url: {
				type: "string",
				format: "uri",
				examples: ["https://tsn.ua/rss/full.rss"],
			}, // optionally
			force: { type: "string", enum: ["1"], examples: ["1"] }, // optionally; "1" = force-refresh cache
		},
		additionalProperties: false,
	} as const,

	// response
	response: {
		200: {
			type: "object",
			required: ["sourceUrl", "meta", "items"],
			properties: {
				sourceUrl: { type: "string" },

				meta: {
					type: "object",
					required: ["title", "link"],
					properties: {
						title: { type: "string" },
						link: { type: "string", format: "uri" },
						description: { type: ["string", "null"] },
						language: { type: ["string", "null"] },
						lastUpdated: { type: ["string", "null"], format: "date-time" },
						image: { type: ["string", "null"], format: "uri" },
					},
					additionalProperties: false,
				},

				items: {
					type: "array",
					items: {
						type: "object",
						properties: {
							title: { type: ["string", "null"] },
							link: { type: ["string", "null"], format: "uri" },
							isoDate: { type: ["string", "null"], format: "date-time" },
							pubDate: { type: ["string", "null"] },
							description: { type: ["string", "null"] },
						},
						additionalProperties: false,
					},
				},
			},
			additionalProperties: false,
		},
	},
} as const;
