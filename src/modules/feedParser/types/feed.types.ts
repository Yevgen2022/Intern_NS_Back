export type NormalizedFeedItem = {
    title?: string;
    link?: string;
    isoDate?: string;
    pubDate?: string;
    description?: string;
};

export type NormalizedFeed = {
    sourceUrl: string;
    items: NormalizedFeedItem[];
};
