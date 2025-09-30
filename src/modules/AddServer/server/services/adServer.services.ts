import type {
	BidRequest,
	BidResponse,
	LineItemWithCreative,
} from "../types/adServer.types";

// Repository interface for DB access

export type AdServerRepo = {
	findActiveLineItems: (filters: {
		size: string;
		geo: string;
		adType: string;
	}) => Promise<LineItemWithCreative[]>;
	checkFrequencyCapping: (
		lineItemId: string,
		userIp: string,
		frequency: number,
	) => Promise<boolean>;
	saveImpression: (lineItemId: string, userIp: string) => Promise<void>;
};

//   Main function to find the best line item
//   Performs filtering, CPM checks, and frequency capping
//
//   @param bidRequest - request from the bid adapter
//   @param repo - repository for DB operations
//   @returns BidResponse or null if nothing is found

export async function findBestLineItem(
	bidRequest: BidRequest,
	repo: AdServerRepo,
): Promise<BidResponse | null> {
	const { size, geo, adType, bidPrice, userIp } = bidRequest;

	// Step 1: Find all active line items with basic filtering
	// Filter by size, geo, adType
	const lineItems = await repo.findActiveLineItems({ size, geo, adType });

	// If nothing is found — return null
	if (lineItems.length === 0) {
		return null;
	}

	// Step 2: Filter by CPM range
	// Keep only those where bidPrice is within [cpmMin, cpmMax]
	const itemsInCpmRange = lineItems.filter(
		(item) => bidPrice >= item.cpmMin && bidPrice <= item.cpmMax,
	);

	if (itemsInCpmRange.length === 0) {
		return null;
	}

	// Step 3: Check frequency capping for each line item
	// Keep only those that can still be shown to this user
	const itemsWithFrequencyCheck = await Promise.all(
		itemsInCpmRange.map(async (item) => {
			// checkFrequencyCapping returns true if it can be shown
			const canShow = await repo.checkFrequencyCapping(
				item.id,
				userIp,
				item.frequency,
			);
			return { item, canShow };
		}),
	);

	// Filter only those that passed the frequency check
	const availableItems = itemsWithFrequencyCheck
		.filter((x) => x.canShow)
		.map((x) => x.item);

	if (availableItems.length === 0) {
		return null;
	}

	// Step 4: Auction — select the line item with the highest cpmMax
	const winner = availableItems.reduce((best, current) =>
		current.cpmMax > best.cpmMax ? current : best,
	);

	// Step 5: Save impression for frequency capping
	await repo.saveImpression(winner.id, userIp);

	// Step 6: Build response
	return {
		lineItemId: winner.id,
		creativeUrl: winner.creative.url,
		cpm: winner.cpmMax,
		size: winner.size,
		adType: winner.adType,
	};
}
