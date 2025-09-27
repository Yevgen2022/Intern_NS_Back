export type NormalizedFeedItem = {
	title: string | null;
	link: string | null;
	isoDate: string | null;
	pubDate: string | null;
	description: string | null;
};

export type FeedMeta = {
	title: string;
	link: string;
	description: string | null;
	language: string | null;
	lastUpdated: string | null;
	image: string | null;
};

export type NormalizedFeed = {
	sourceUrl: string;
	items: NormalizedFeedItem[];
	meta: FeedMeta;
};
