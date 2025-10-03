import type { AdType } from "@prisma/client";

//Request from the bid adapter
//Contains parameters for selecting a line item

export type BidRequest = {
	//Banner size, e.g., "300x250"
	size: string;
	// Geo targeting (country), e.g., "US", "UA"
	geo: string;
	// Ad type: banner, video, native
	adType: AdType;
	// CPM bid offered by the bidder
	bidPrice: number;
	// User IP address (for frequency capping)
	userIp: string;
};

//Response from the AdServer
//Contains information about the selected line item

export type BidResponse = {
	// ID of the selected line item
	lineItemId: string;
	// URL of the creative to display
	creativeUrl: string;
	// CPM of the selected line item
	cpm: number;
	// Creative size
	size: string;
	// Ad type
	adType: AdType;
};

// Line item with additional creative information
// Used internally by the service

export type LineItemWithCreative = {
	id: string;
	size: string;
	cpmMin: number;
	cpmMax: number;
	geo: string[];
	adType: AdType;
	frequency: number;
	creativeId: string;
	creative: {
		url: string;
	};
};

// Ad impression log for frequency capping
// Stored in MongoDB

export type ImpressionLog = {
	id: string;
	lineItemId: string;
	userIp: string;
	timestamp: Date;
};
