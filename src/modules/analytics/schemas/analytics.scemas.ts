// only body of request 200
export const getSummaryResponseSchema = {
	type: "object",
	required: ["success", "data"],
	additionalProperties: false,
	properties: {
		success: { type: "boolean" },
		data: {
			type: "array",
			items: {
				type: "object",
				required: [
					"bidder",
					"total_bids",
					"wins",
					"avg_cpm",
					"min_cpm",
					"max_cpm",
				],
				additionalProperties: false,
				properties: {
					bidder: { type: "string" },
					total_bids: { type: "integer" },
					wins: { type: "integer" },
					avg_cpm: { type: "number" },
					min_cpm: { type: "number" },
					max_cpm: { type: "number" },
				},
			},
		},
	},
} as const;

// general schema of mistake Fastify httpErrors.*
export const errorSchema = {
	type: "object",
	required: ["statusCode", "error", "message"],
	additionalProperties: true, // можна true, бо Fastify інколи додає інші поля
	properties: {
		statusCode: { type: "number" },
		error: { type: "string" },
		message: { type: "string" },
	},
} as const;

// full schema of route
export const getSummarySchema = {
	tags: ["analytics"],
	summary: "Get aggregated statistics",
	description:
		"Returns aggregated stats by bidder: total bids, wins, avg CPM, min CPM, max CPM.",
	querystring: {
		type: "object",
		additionalProperties: false,
		properties: {
			startDate: { type: "string", format: "date-time" },
			endDate: { type: "string", format: "date-time" },
			bidder: { type: "string" },
		},
	},
	response: {
		200: getSummaryResponseSchema,
		400: errorSchema,
		401: errorSchema,
		502: errorSchema,
		500: errorSchema,
	},
} as const;
