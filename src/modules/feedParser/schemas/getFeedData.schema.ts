// // modules/feed/schemas/getFeedData.schema.ts

export const schema = {
	tags: ["feed"],
	summary: "Get feed data",
	response: {
		200: {
			type: "object",
			required: ["sourceUrl", "items"],
			properties: {
				sourceUrl: { type: "string" },
				items: {
					type: "array",
					items: {
						type: "object",
						properties: {
							title: { type: ["string", "null"] },
							link: { type: ["string", "null"] },
							isoDate: { type: ["string", "null"] },
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
