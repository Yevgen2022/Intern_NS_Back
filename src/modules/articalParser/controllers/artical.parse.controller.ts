// modules/articalParser/controllers/artical.parse.controller.ts
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parseArticle } from "../services/artical.parse.service";

export function parseArticleController(fastify: FastifyInstance) {
    return {
        parseArticleController: async (req: FastifyRequest, reply: FastifyReply) => {
            const url = (req.body as { url?: string } | undefined)?.url;
            if (!url) return reply.badRequest("Field 'url' is required.");

            try {
                const result = await parseArticle(url);
                return reply.send(result);
            } catch (err: any) {
                if (err?.code === "UNSUPPORTED_SITE") {
                    return reply.status(422).send({ message: "This URL looks like SPA/SSR or dynamic. Static pages only." });
                }
                if (err?.code === "FETCH_FAILED") {
                    return reply.status(502).send({ message: "Failed to fetch the source URL." });
                }
                if (err?.code === "PARSING_FAILED") {
                    return reply.status(500).send({ message: "Failed to parse the article HTML." });
                }
                fastify.log.error({ err }, "parseArticleController failed");
                return reply.status(500).send({ message: "Unexpected error" });
            }
        },
    };
}
