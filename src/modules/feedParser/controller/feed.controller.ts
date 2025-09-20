import type { FastifyReply, FastifyRequest } from "fastify";
import { DEFAULT_FEED_URL, feedService } from "../services/feed.service";

export async function getFeedDataController(
    request: FastifyRequest,
    reply: FastifyReply,
) {


    //reading query parameters , destruction
    const { url, force } = request.query as {
        url?: string;
        force?: string | number | boolean;
    };

    //default URL from destruction
    const sourceUrl = url ?? DEFAULT_FEED_URL;


    //force normalization to boolean  from destruction
    const forceBool =
        force === 1 || force === "1" || force === true || force === "true";


    //basic logic in try/catch
    try {
        const data = await feedService.getFeed(sourceUrl, forceBool);
        return reply.send(data);
    } catch (e: any) {
        request.log.error(e, "feed parsing error");
        return reply.code(502).send({ error: "Feed fetch/parse failed" });
    }
}
