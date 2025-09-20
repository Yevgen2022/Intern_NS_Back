import type { FastifyReply, FastifyRequest } from "fastify";

const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";

export async function getFeedDataController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { url, force } = request.query as {
        url?: string;
        force?: string | number | boolean;
    };

    const feedUrl = url ?? DEFAULT_FEED_URL;

    return {
        message: "Feed endpoint",
        url: feedUrl,
        force: force ?? 0,
    };
}
