import type { FastifyReply, FastifyRequest } from "fastify";
import { getFeed } from "../services/feed.service";

export async function getFeedDataController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// read query params
	const { url, force } = request.query as {
		url?: string;
		force?: string | number | boolean;
	};

	// normalize force to boolean
	const forceBool =
		force === 1 || force === "1" || force === true || force === "true";

	try {
		// service will handle default URL and caching
		const data = await getFeed(url, forceBool);
		return reply.send(data);
	} catch (e: any) {
		request.log.error(e, "feed parsing error");
		return reply.code(502).send({ error: "Feed fetch/parse failed" });
	}
}
