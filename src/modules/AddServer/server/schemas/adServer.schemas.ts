import { AdType } from "@prisma/client";

//   Schema for validating the incoming request from a bid adapter
//   Used in POST /api/adserver/bid

export const bidRequestSchema = {
	type: "object",
	required: ["size", "geo", "adType", "bidPrice", "userIp"],
	properties: {
		size: {
			type: "string",
			pattern: "^\\d+x\\d+$", // format "300x250"
			description: "Ad size in format WIDTHxHEIGHT",
			examples: ["300x250", "728x90", "160x600"],
		},
		geo: {
			type: "string",
			minLength: 2,
			maxLength: 2,
			description: "Two-letter country code",
			examples: ["US", "UA", "GB"],
		},
		adType: {
			type: "string",
			enum: Object.values(AdType), // ["banner", "video", "native"]
			description: "Type of advertisement",
		},
		bidPrice: {
			type: "number",
			minimum: 0.01,
			description: "CPM bid price from bidder",
			examples: [2.5, 1.8, 5.0],
		},
		userIp: {
			type: "string",
			format: "ipv4", // IP address validation
			description: "User IP address for frequency capping",
			examples: ["192.168.1.1", "10.0.0.1"],
		},
	},
	additionalProperties: false,
} as const;

//Schema for a successful line item match response

export const bidResponseSchema = {
	type: "object",
	required: ["lineItemId", "creativeUrl", "cpm", "size", "adType"],
	properties: {
		lineItemId: {
			type: "string",
			description: "Selected line item ID",
		},
		creativeUrl: {
			type: "string",
			description: "URL of the creative to display",
			examples: ["/creatives/abc-123.jpg"],
		},
		cpm: {
			type: "number",
			description: "Final CPM price",
		},
		size: {
			type: "string",
			description: "Creative size",
		},
		adType: {
			type: "string",
			enum: Object.values(AdType),
			description: "Type of advertisement",
		},
	},
} as const;

//  * Schema for the error when no suitable line items are found

export const noBidResponseSchema = {
	type: "object",
	required: ["message"],
	properties: {
		message: {
			type: "string",
			examples: ["No suitable line items found"],
		},
	},
} as const;
