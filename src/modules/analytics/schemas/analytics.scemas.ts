////////////////////////////////////////////////////////////////////////////////////////////////////

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
	additionalProperties: true, //true, because Fastify sometimes adds other fields
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
		// examples: {
		//     startDate: "2025-10-01T00:00:00Z",
		//     endDate: "2025-10-02T00:00:00Z",
		//     bidder: "Adtelligent",
		// },
	},
	response: {
		200: getSummaryResponseSchema,
		400: errorSchema,
		401: errorSchema,
		502: errorSchema,
		500: errorSchema,
	},
} as const;

export const eventItemSchema = {
	type: "object",
	additionalProperties: true,
	required: [
		"timestamp",
		"bidder",
		"bid_cpm",
		"is_winner",
		"auction_id",
		"event_type",
	],
	properties: {
		// Required fields
		timestamp: { type: "string" },
		bidder: { type: "string" },
		bid_cpm: { type: "number" },
		is_winner: { type: "integer" },
		auction_id: { type: "string" },
		event_type: { type: "string" },
		ad_unit_code: { type: "string" },

		//Optional basic fields
		min_cpm: { type: "number" },
		max_cpm: { type: "number" },
		bid_currency: { type: "string" },

		// New fields for Prebid tracker
		page_url: { type: "string" },
		user_agent: { type: "string" },
		creative_id: { type: "string" },
		ad_unit_size: { type: "string" },

		// Geo data
		geo_country: { type: "string" },
		geo_city: { type: "string" },

		// Device/Browser data
		device_type: { type: "string" },
		browser: { type: "string" },
		os: { type: "string" },

		// Additional metrics
		campaign_id: { type: "string" },
		render_time: { type: "number" },
	},
} as const;

export const getEventsResponseSchema = {
	type: "object",
	required: ["success", "data"],
	additionalProperties: false,
	properties: {
		success: { type: "boolean" },
		data: {
			type: "array",
			items: eventItemSchema,
		},
	},
} as const;

export const getEventsSchema = {
	tags: ["analytics"],
	summary: "Get auction events",
	description:
		"Retrieves auction events with optional filters: startDate, endDate, bidder, limit.",
	querystring: {
		type: "object",
		additionalProperties: false,
		properties: {
			startDate: { type: "string", format: "date-time" },
			endDate: { type: "string", format: "date-time" },
			bidder: { type: "string", minLength: 1, maxLength: 255 },
			limit: { type: "integer", minimum: 1, maximum: 1000, default: 100 },
		},
		examples: [
			{
				succes: true,
				data: [
					{
						startDate: "2025-10-01T00:00:00Z",
						endDate: "2025-10-02T00:00:00Z",
						bidder: "Adtelligent",
						limit: 100,
					},
				],
			},
		],
	},
	response: {
		200: getEventsResponseSchema,
		400: errorSchema,
		401: errorSchema,
		502: errorSchema,
		500: errorSchema,
	},
} as const;
