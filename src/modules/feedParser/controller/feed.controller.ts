import type { FastifyReply, FastifyRequest } from "fastify";
import { DEFAULT_FEED_URL, feedService } from "../services/feed.service";

export async function getFeedDataController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { url, force } = request.query as {
        url?: string;
        force?: string | number | boolean;
    };

    const feedUrl = url ?? DEFAULT_FEED_URL;

    try {
        // тимчасово ігноруємо force; далі додамо БД-логіку
        const data = await feedService.parseFeed(feedUrl);
        return data;
    } catch (e: any) {
        request.log.error(e, "feed parsing error");
        return reply.code(502).send({ error: "Feed fetch/parse failed" });
    }
}
