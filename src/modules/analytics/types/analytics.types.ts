export interface AuctionEvent {
	event_id: string;
	event_type: string;
	timestamp: Date;
	auction_id: string;
	ad_unit_code: string;
	bidder: string;
	bid_cpm: number;
	bid_currency?: string;
	campaign_id?: string;
	creative?: string;
	geo_country?: string;
	geo_city?: string;
	device_type?: string;
	browser?: string;
	os?: string;
	is_winner: number;
	render_time?: number;
}

export interface EventFilters {
	startDate?: Date;
	endDate?: Date;
	bidder?: string;
	limit?: number;
}

export interface SummaryFilters {
	startDate?: Date;
	endDate?: Date;
}

export interface EventBody {
	event_id: string;
	event_type: string;
	auction_id: string;
	ad_unit_code: string;
	bidder: string;
	bid_cpm: number;
	bid_currency?: string;
	campaign_id?: string;
	creative?: string;
	geo_country?: string;
	geo_city?: string;
	device_type?: string;
	browser?: string;
	os?: string;
	is_winner: number;
	render_time?: number;
}

export interface QueryParams {
	startDate?: string;
	endDate?: string;
	bidder?: string;
	limit?: string;
}

// type of request ClickHouse
export interface EventRow {
	event_id: string;
	event_type: string;
	timestamp: string; // ClickHouse return date as string
	auction_id: string;
	ad_unit_code: string;
	bidder: string;
	bid_cpm: number;
	bid_currency: string;
	campaign_id: string;
	creative: string;
	geo_country: string;
	geo_city: string;
	device_type: string;
	browser: string;
	os: string;
	is_winner: number;
	render_time: number;
}

export interface SummaryRow {
	bidder: string;
	total_bids: string; // ClickHouse count() return date as string
	wins: string; // ClickHouse sum() return date as string
	avg_cpm: number;
	max_cpm: number;
}
