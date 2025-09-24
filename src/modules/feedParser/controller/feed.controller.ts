// import type { FastifyReply, FastifyRequest } from "fastify";
// import type { FromSchema } from "json-schema-to-ts";
// import type { schema as getFeedDataSchema } from "../schemas/getFeedData.schema"; // schema import
// import { getFeed } from "../services/feed.service";
//
// //type is automatically generated from the schema
// type FeedQuery = FromSchema<typeof getFeedDataSchema.querystring>;
//
// export async function getFeedDataController(
// 	request: FastifyRequest<{ Querystring: FeedQuery }>,
// 	reply: FastifyReply,
// ) {
// 	const { prisma } = request.server;
// 	const { url, force } = request.query;
//
// 	const forceBool = force === "1";
//
// 	try {
// 		const data = await getFeed(prisma, url, forceBool);
// 		return reply.send(data);
// 	} catch (e: unknown) {
// 		request.log.error(e, "feed parsing error");
// 		return reply.badGateway("Feed fetch/parse failed");
// 	}
// }


// modules/feed/controller/feed.controller.ts
// import type { FastifyReply, FastifyRequest } from "fastify";
// import { getFeed } from "../services/feed.service"; // NEW: беремо оновлений сервіс
// import type { PrismaClient } from "@prisma/client"; // NEW: для підказок TS
//
// // NEW: тип для query — простий і зрозумілий
// type GetFeedQuery = {
//     url?: string;   // опціональний; якщо не передали — в сервісі підставиться DEFAULT_FEED_URL
//     force?: "1";    // якщо "1" → не використовуємо кеш
// };
//
// export async function getFeedDataController(
//     req: FastifyRequest<{ Querystring: GetFeedQuery }>,
//     reply: FastifyReply
// ) {
//     try {
//         const { url, force } = req.query ?? {};
//         const useForce = force === "1"; // NEW: інтерпретуємо тільки "1" як true
//
//         // NEW: беремо prisma з fastify instance (якщо в тебе fastify.prisma плагін)
//         const prisma = (req.server as any).prisma as PrismaClient;
//
//         // NEW: викликаємо сервіс — усі лінки вже будуть нормалізовані/відфільтровані
//         const data = await getFeed(prisma, url, useForce);
//
//         return reply.send(data);
//     } catch (err) {
//         req.log.error({ err }, "getFeedDataController failed");
//         return reply.status(500).send({ message: "Failed to load feed" });
//     }
// }


import type { FastifyReply, FastifyRequest } from "fastify";
import { getFeed } from "../services/feed.service";
import type { PrismaClient } from "@prisma/client";

type GetFeedQuery = {
    url?: string;
    force?: "1";
};

export async function getFeedDataController(
    req: FastifyRequest<{ Querystring: GetFeedQuery }>,
    reply: FastifyReply
) {
    try {
        const { url, force } = req.query ?? {};
        const useForce = force === "1";

        const prisma = (req.server as any).prisma as PrismaClient;

        // ВИПРАВЛЕННЯ: Перевіряємо чи prisma доступна
        if (!prisma) {
            req.log.error("Prisma client not available");
            return reply.status(500).send({ message: "Database connection error" });
        }

        const data = await getFeed(prisma, url, useForce);

        return reply.send(data);
    } catch (err) {
        req.log.error({ err }, "getFeedDataController failed");

        // ВИПРАВЛЕННЯ: Більш специфічні коди помилок
        if (err instanceof Error) {
            if (err.message.includes("Invalid feed URL")) {
                return reply.status(400).send({ message: "Invalid feed URL provided" });
            }
            if (err.message.includes("Failed to parse feed")) {
                return reply.status(502).send({ message: "Failed to fetch or parse feed" });
            }
        }

        return reply.status(500).send({ message: "Failed to load feed" });
    }
}