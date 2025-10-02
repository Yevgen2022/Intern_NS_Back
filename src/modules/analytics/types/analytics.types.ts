////////////////////////////////////////////////////////////////////////////////////////////////////

// EventBody - what comes from the frontend (POST /api/analytics/events)
export interface EventBody {
	event_id: string;
	event_type: string;
	auction_id: string;
	ad_unit_code: string;
	bidder: string;
	bid_cpm: number;
	is_winner: number;

	// Optional fields
	bid_currency?: string;
	campaign_id?: string;
	creative_id?: string;

	// Geo data
	geo_country?: string;
	geo_city?: string;

	// Device/Browser data
	device_type?: string;
	browser?: string;
	os?: string;
	user_agent?: string;

	// Додаткові метрики
	render_time?: number;
	ad_unit_size?: string;
	page_url?: string;
}

// AuctionEvent - which is stored в ClickHouse (EventBody + timestamp)
export interface AuctionEvent {
	event_id: string;
	event_type: string;
	timestamp: Date;
	auction_id: string;
	ad_unit_code: string;
	bidder: string;
	bid_cpm: number;
	is_winner: number;

	// Optional fields
	bid_currency?: string;
	campaign_id?: string;
	creative_id?: string;

	// Geo data
	geo_country?: string;
	geo_city?: string;

	// Device/Browser data
	device_type?: string;
	browser?: string;
	os?: string;
	user_agent?: string;

	// Additional metrics
	render_time?: number;
	ad_unit_size?: string;
	page_url?: string;
}

//EventRow - what is returned from GET /events (minimum set for UI)
export interface EventRow {
	timestamp: string; // ISO string
	bidder: string;
	bid_cpm: number;
	is_winner: number;
	auction_id: string;
	event_type: string;
	ad_unit_code: string;

	// Optional (if needed on the front)
	min_cpm?: number;
	max_cpm?: number;
	geo_country?: string;
	creative_id?: string;
}

//SummaryRow - агрегована статистика по bidder
export interface SummaryRow {
	bidder: string;
	total_bids: string; // ClickHouse count() returns string
	wins: string; // ClickHouse sum() returns string
	avg_cpm: number;
	min_cpm: number;
	max_cpm: number;
}

//EventFilters - filters for GET /events
export interface EventFilters {
	startDate?: Date;
	endDate?: Date;
	bidder?: string;
	limit?: number;
}

//SummaryFilters - filters for GET /summary
export interface SummaryFilters {
	startDate?: Date;
	endDate?: Date;
	bidder?: string;
}

//QueryParams - what comes in the query string (all as string)
export interface QueryParams {
	startDate?: string;
	endDate?: string;
	bidder?: string;
	limit?: string;
}

//Prebid Event Types (for frontend tracker)
export type PrebidEventType =
	| "auctionInit"
	| "bidRequested"
	| "bidResponse"
	| "bidWon"
	| "bidTimeout"
	| "auctionEnd";
