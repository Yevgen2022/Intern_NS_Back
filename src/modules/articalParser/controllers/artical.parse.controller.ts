// controllers/artical.parse.controller.ts

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parseArticle } from "../services/artical.parse.service";
function sanitizeAndNormalizeUrl(raw: unknown): string {
    if (typeof raw !== "string") throw new Error("URL must be a string");

    let s = raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, ""); // zero-width
    if (s.includes("…")) throw new Error("URL looks truncated (contains …)");
    // якщо раптом прослизнули пробіли — закодуємо
    if (/\s/.test(s)) s = s.replace(/\s+/g, "%20");

    let u: URL;
    try { u = new URL(s); } catch { throw new Error("Invalid URL"); }
    if (!/^https?:$/.test(u.protocol)) throw new Error("Only http/https URLs are supported.");
    return u.toString();
}

export function parseArticleController(fastify: FastifyInstance) {
    return {
        parseArticleController: async (req: FastifyRequest, reply: FastifyReply) => {
            try {
                const body = req.body as { url?: string; force?: boolean } | undefined;
                if (!body?.url) return reply.badRequest("Field 'url' is required.");
                const url = sanitizeAndNormalizeUrl(body.url);

                const result = await parseArticle(url, body.force === true);
                return reply.send(result);
            } catch (err: any) {
                const msg = err?.message || "Unexpected error";
                if (/URL/.test(msg) || /Invalid URL/.test(msg)) {
                    return reply.status(400).send({ message: msg });
                }
                if (err?.code === "UNSUPPORTED_SITE") {
                    return reply.status(422).send({ message: "Dynamic (SPA/SSR) page detected. Static pages only." });
                }
                if (err?.code === "FETCH_FAILED") return reply.status(502).send({ message: "Failed to fetch the source URL." });
                if (err?.code === "PARSING_FAILED") return reply.status(500).send({ message: "Failed to parse the article HTML." });
                fastify.log.error({ err }, "parseArticleController failed");
                return reply.status(500).send({ message: msg });
            }
        },
    };
}
