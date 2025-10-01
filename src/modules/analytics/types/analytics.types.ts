
    // this: is an internal "auction event" that we record in the DB.
    // is taken: from the EventBody (which came in the POST), + we add a timestamp: new Date().
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


    // a set of filters for selecting raw events /events.
    // Consists of: startDate?: Date, endDate?: Date, bidder?: string, limit?: number.
export interface EventFilters {
	startDate?: Date;
	endDate?: Date;
	bidder?: string;
	limit?: number;
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
// export interface EventRow {
// 	event_id: string;
// 	event_type: string;
// 	timestamp: string; // ClickHouse return date as string
// 	auction_id: string;
// 	ad_unit_code: string;
// 	bidder: string;
// 	bid_cpm: number;
//     min_cpm: number;
//     max_cpm: number;
// 	bid_currency: string;
// 	campaign_id: string;
// 	creative: string;
// 	geo_country: string;
// 	geo_city: string;
// 	device_type: string;
// 	browser: string;
// 	os: string;
// 	is_winner: number;
// 	render_time: number;
// }


//in service
//response string for the GET /events endpoint (what comes from ClickHouse and is given to the client).
//Consists of: minimum required fields for the front
//(you have: timestamp, bidder, bid_cpm, min_cpm, max_cpm, is_winner, auction_id).
export interface EventRow {
    timestamp: string;     // return as string ISO
    bidder: string;
    bid_cpm: number;
    min_cpm: number;
    max_cpm: number;
    is_winner: number;
    auction_id: string;
}

   // response string for the GET /summary endpoint (aggregate by bidder).
   // Consists of: bidder, total_bids, wins, avg_cpm, min_cpm, max_cpm (all as number; you changed string to number correctly).

export interface SummaryRow {
	bidder: string;
	total_bids: string;     // ClickHouse count() return date as string
	wins: string;          // ClickHouse sum() return date as string
	avg_cpm: number;
    min_cpm: number;
	max_cpm: number;
}


    // filters for aggregated statistics /summary.
    // Consists of: startDate?: Date, endDate?: Date, bidder?: string (optional).
    // Flow: controller reads query → converts to SummaryFilters → service → repository.getSummary(filters)`.
export interface SummaryFilters {
    startDate?: Date;
    endDate?: Date;
    bidder?: string;
}