import type { FastifyReply, FastifyRequest } from "fastify";
import { getFeed } from "../services/feed.service";

type FeedQuery = {
	url?: string;
	force?: "1";
};

export async function getFeedDataController(
	request: FastifyRequest<{ Querystring: FeedQuery }>,
	reply: FastifyReply,
) {
	const { prisma } = request.server;
	const { url, force } = request.query;

	const forceBool = force === "1";

	try {
		const data = await getFeed(prisma, url, forceBool);
		return reply.send(data);
	} catch (e: unknown) {
		request.log.error(e, "feed parsing error");
		return reply.badGateway("Feed fetch/parse failed");
	}
}
