// src/modules/feed/schemas/getFeedData.schema.ts

export const schema = {
	tags: ["feed"],
	summary: "Get feed data",

	// query parameter typing
	querystring: {
		type: "object",
		properties: {
			url: { type: "string", format: "uri" }, // opt
			force: { type: "string", enum: ["1"] }, // only '1', opt
		},
		additionalProperties: false,
	} as const,

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
