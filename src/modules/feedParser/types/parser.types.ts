export type RssItem = {
	title?: string;
	link?: string;
	isoDate?: string;
	pubDate?: string;
	contentSnippet?: string;
	content?: string;
	summary?: string;
	description?: string;
};

export type RssFeed = {
	title?: string;
	link?: string;
	description?: string;
	language?: string;
	lastBuildDate?: string;
	image?: { url?: string } | undefined;
	items?: RssItem[] | undefined;
};
