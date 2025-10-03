// Body from frontend
export interface EventBody {
	event_id: string;
	event_type: string;
	auction_id: string;
	ad_unit_code: string;
	bidder: string;
	bid_cpm: number;
	is_winner: number;

	bid_currency?: string;
	campaign_id?: string;
	creative_id?: string;
	geo_country?: string;
	geo_city?: string;
	device_type?: string;
	browser?: string;
	os?: string;
	user_agent?: string;
	render_time?: number;
	ad_unit_size?: string;
	page_url?: string;
}

// I write in ClickHouse (Date instead of string for timestamp)
export interface AuctionEvent extends EventBody {
	timestamp: Date;
}

// Minimum set for для UI (raw view)
export interface EventRow {
	timestamp: string;
	bidder: string;
	bid_cpm: number;
	is_winner: number;
	auction_id: string;
	event_type: string;
	ad_unit_code: string;

	// optional
	bid_currency?: string;
	geo_country?: string;
	creative_id?: string;
	ad_unit_size?: string;
	page_url?: string;
}

// summary by bidder (view=summary)
export interface SummaryRow {
	bidder: string;
	total_bids: string; // ClickHouse повертає string
	wins: string;
	avg_cpm: number;
	min_cpm: number;
	max_cpm: number;
}

// filters raw-подій
export interface EventFilters {
	startDate?: Date;
	endDate?: Date;
	bidder?: string;

	event_type?: string;
	ad_unit_code?: string;
	ad_unit_size?: string;
	is_winner?: "0" | "1";
	min_cpm?: string;
	max_cpm?: string;
	bid_currency?: string;
	device_type?: string;
	browser?: string;
	os?: string;
	geo_country?: string;
	geo_city?: string;
	campaign_id?: string;
	creative_id?: string;

	limit?: number;
	offset?: number;
	order_by?: string; // whitelist у service/repo
	order_dir?: "asc" | "desc";
}

// filters summary
export interface SummaryFilters {
	startDate?: Date;
	endDate?: Date;
	bidder?: string;
}

// what comes in the query (all as a string)
export interface QueryParams {
	startDate?: string;
	endDate?: string;
	bidder?: string;

	event_type?: string;
	ad_unit_code?: string;
	ad_unit_size?: string;
	is_winner?: "0" | "1";
	min_cpm?: string;
	max_cpm?: string;
	bid_currency?: string;
	device_type?: string;
	browser?: string;
	os?: string;
	geo_country?: string;
	geo_city?: string;
	campaign_id?: string;
	creative_id?: string;

	limit?: string;
	offset?: string;
	order_by?: string;
	order_dir?: "asc" | "desc";
	view?: "raw" | "summary";
}

export type PrebidEventType =
	| "auctionInit"
	| "bidRequested"
	| "bidResponse"
	| "bidWon"
	| "bidTimeout"
	| "auctionEnd";
