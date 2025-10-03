//general error patterns
export const errorSchema = {
	type: "object",
	required: ["statusCode", "error", "message"],
	additionalProperties: true,
	properties: {
		statusCode: { type: "number" },
		error: { type: "string" },
		message: { type: "string" },
	},
} as const;

//description of one raw event
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
		timestamp: { type: "string" },
		bidder: { type: "string" },
		bid_cpm: { type: "number" },
		is_winner: { type: "integer" },
		auction_id: { type: "string" },
		event_type: { type: "string" },
		ad_unit_code: { type: "string" },

		// optional
		bid_currency: { type: "string" },
		page_url: { type: "string" },
		user_agent: { type: "string" },
		creative_id: { type: "string" },
		ad_unit_size: { type: "string" },
		geo_country: { type: "string" },
		geo_city: { type: "string" },
		device_type: { type: "string" },
		browser: { type: "string" },
		os: { type: "string" },
		campaign_id: { type: "string" },
		render_time: { type: "number" },
	},
} as const;

//summary-row (for view=summary)
export const summaryItemSchema = {
	type: "object",
	additionalProperties: false,
	required: ["bidder", "total_bids", "wins", "avg_cpm", "min_cpm", "max_cpm"],
	properties: {
		bidder: { type: "string" },
		total_bids: { type: "string" }, // CH повертає string для count()
		wins: { type: "string" }, // і для sum()
		avg_cpm: { type: "number" },
		min_cpm: { type: "number" },
		max_cpm: { type: "number" },
	},
} as const;

//GET /events response (raw or summary)
export const getEventsResponseSchema = {
	type: "object",
	required: ["success", "data"],
	additionalProperties: false,
	properties: {
		success: { type: "boolean" },
		data: {
			oneOf: [
				{ type: "array", items: eventItemSchema }, // view=raw
				{ type: "array", items: summaryItemSchema }, // view=summary
			],
		},
		count: { type: "integer" },
		limit: { type: "integer" },
		offset: { type: "integer" },
	},
} as const;

//one schema for GET /events
export const getEventsSchema = {
	tags: ["analytics"],
	summary: "Get auction events (raw or summary)",
	description:
		"Retrieves auction events with filters. Use view=raw (default) or view=summary for aggregation by bidder.",
	querystring: {
		type: "object",
		additionalProperties: false,
		properties: {
			// basic
			startDate: { type: "string" }, // формат дати довільний (parseDateTimeBestEffort)
			endDate: { type: "string" },
			bidder: { type: "string", minLength: 1, maxLength: 255 },

			// other filters (all optional)
			event_type: { type: "string" },
			ad_unit_code: { type: "string" },
			ad_unit_size: { type: "string" },
			is_winner: { type: "string", enum: ["0", "1"] },
			min_cpm: { type: "string" },
			max_cpm: { type: "string" },
			bid_currency: { type: "string" },
			device_type: { type: "string" },
			browser: { type: "string" },
			os: { type: "string" },
			geo_country: { type: "string" },
			geo_city: { type: "string" },
			campaign_id: { type: "string" },
			creative_id: { type: "string" },

			// pagination/sorting
			limit: { type: "integer", minimum: 1, maximum: 1000, default: 100 },
			offset: { type: "integer", minimum: 0, default: 0 },
			order_by: { type: "string", default: "timestamp" },
			order_dir: { type: "string", enum: ["asc", "desc"], default: "desc" },

			// regime
			view: { type: "string", enum: ["raw", "summary"], default: "raw" },
		},
	},
	response: {
		200: getEventsResponseSchema,
		400: errorSchema,
		401: errorSchema,
		502: errorSchema,
		500: errorSchema,
	},
} as const;
