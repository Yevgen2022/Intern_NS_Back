import type {
	FastifyError,
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import { parseArticle } from "../services/artical.parse.service";

// Clean up and validate the URL before using it
function cleanAndValidateUrl(userInput: unknown): string {
	if (typeof userInput !== "string") {
		throw new Error("URL must be a string");
	}

	let cleanUrl = userInput.trim().replace(/[\u200B-\u200D\uFEFF]/g, ""); // Remove zero-width chars

	if (cleanUrl.includes("…")) {
		throw new Error("URL looks truncated (contains …)");
	}

	if (cleanUrl.includes(" ")) {
		cleanUrl = cleanUrl.replace(/\s+/g, "%20");
	}

	let validUrl: URL;
	try {
		validUrl = new URL(cleanUrl);
	} catch {
		throw new Error("Invalid URL");
	}

	if (validUrl.protocol !== "http:" && validUrl.protocol !== "https:") {
		throw new Error("Only http/https URLs are supported.");
	}

	return validUrl.toString();
}

function pickMessageAndCode(e: unknown): { message: string; code?: string } {
	if (typeof e === "object" && e !== null) {
		const obj = e as Partial<FastifyError> &
			Partial<Error> &
			Record<string, unknown>;
		const message =
			typeof obj.message === "string" ? obj.message : "Unexpected error";
		const code = typeof obj.code === "string" ? obj.code : undefined;
		return { message, code };
	}
	return { message: String(e) };
}

export function parseArticleController(fastify: FastifyInstance) {
	return {
		parseArticleController: async (
			request: FastifyRequest,
			reply: FastifyReply,
		) => {
			try {
				const body = request.body as
					| { url?: string; force?: boolean }
					| undefined;

				if (!body?.url) {
					throw fastify.httpErrors.badRequest("Field 'url' is required.");
				}

				const url = cleanAndValidateUrl(body.url);
				const force = body.force === true;

				const result = await parseArticle(url, force);
				return reply.send(result);
			} catch (error: unknown) {
				const { message, code } = pickMessageAndCode(error);

				// URL validation errors from cleanAndValidateUrl
				if (/URL/.test(message) || /Invalid URL/.test(message)) {
					throw fastify.httpErrors.badRequest(message);
				}

				// Service-layer codes
				if (code === "UNSUPPORTED_SITE") {
					throw fastify.httpErrors.unprocessableEntity(
						"Dynamic (SPA/SSR) page detected. Static pages only.",
					);
				}
				if (code === "FETCH_FAILED") {
					throw fastify.httpErrors.badGateway(
						"Failed to fetch the source URL.",
					);
				}
				if (code === "PARSING_FAILED") {
					throw fastify.httpErrors.internalServerError(
						"Failed to parse the article HTML.",
					);
				}

				// Fallback: log and rethrow as 500
				fastify.log.error({ err: error }, "parseArticleController failed");
				throw fastify.httpErrors.internalServerError(message);
			}
		},
	};
}
