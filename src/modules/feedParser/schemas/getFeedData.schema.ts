// modules/feed/schemas/getFeedData.schema.ts
export const schema = {
	tags: ["feed"],
	summary: "Get feed data",
	description: "Get parsed feed items",
	// (опціонально) querystring теж пропиши тут
	response: {
		200: {
			type: "object",
			additionalProperties: false,
			required: ["sourceUrl", "items"],
			properties: {
				sourceUrl: { type: "string" },
				title: { type: ["string", "null"] },
				lastBuildDate: { type: ["string", "null"] },
				items: {
					type: "array",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							title: { type: ["string", "null"] },
							link: { type: ["string", "null"] },
							isoDate: { type: ["string", "null"] },
							pubDate: { type: ["string", "null"] },
							description: { type: ["string", "null"] },
						},
					},
				},
			},
		},
	},
} as const;
