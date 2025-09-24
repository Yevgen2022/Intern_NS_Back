import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parseArticle } from "../services/artical.parse.service";

// Clean up and validate the URL before using it
function cleanAndValidateUrl(userInput: unknown): string {
    // Make sure input is a string
    if (typeof userInput !== "string") {
        throw new Error("URL must be a string");
    }

    // Remove spaces at start/end and invisible characters
    let cleanUrl = userInput.trim();
    cleanUrl = cleanUrl.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Remove zero-width characters

    // Check if URL looks cut off
    if (cleanUrl.includes("…")) {
        throw new Error("URL looks truncated (contains …)");
    }

    // Replace spaces with proper encoding
    if (cleanUrl.includes(" ")) {
        cleanUrl = cleanUrl.replace(/\s+/g, "%20");
    }

    // Try to create a proper URL object to validate it
    let validUrl: URL;
    try {
        validUrl = new URL(cleanUrl);
    } catch {
        throw new Error("Invalid URL");
    }

    // Only allow http and https protocols
    if (validUrl.protocol !== "http:" && validUrl.protocol !== "https:") {
        throw new Error("Only http/https URLs are supported.");
    }

    return validUrl.toString();
}

export function parseArticleController(fastify: FastifyInstance) {
    return {
        parseArticleController: async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                // Get the request body data
                const requestBody = request.body as { url?: string; force?: boolean } | undefined;

                // Check if URL was provided
                if (!requestBody || !requestBody.url) {
                    return reply.badRequest("Field 'url' is required.");
                }

                // Clean and validate the URL
                const cleanUrl = cleanAndValidateUrl(requestBody.url);

                // Check if force parsing is requested
                const forceMode = requestBody.force === true;

                // Parse the article
                const parseResult = await parseArticle(cleanUrl, forceMode);

                // Send successful response
                return reply.send(parseResult);

            } catch (error: any) {
                // Get error message
                const errorMessage = error?.message || "Unexpected error";

                // Handle URL validation errors
                if (errorMessage.includes("URL") || errorMessage.includes("Invalid URL")) {
                    return reply.status(400).send({ message: errorMessage });
                }

                // Handle different types of parsing errors
                if (error?.code === "UNSUPPORTED_SITE") {
                    return reply.status(422).send({
                        message: "Dynamic (SPA/SSR) page detected. Static pages only."
                    });
                }

                if (error?.code === "FETCH_FAILED") {
                    return reply.status(502).send({
                        message: "Failed to fetch the source URL."
                    });
                }

                if (error?.code === "PARSING_FAILED") {
                    return reply.status(500).send({
                        message: "Failed to parse the article HTML."
                    });
                }

                // Log unexpected errors for debugging
                fastify.log.error({ err: error }, "parseArticleController failed");

                // Return generic error for unexpected cases
                return reply.status(500).send({ message: errorMessage });
            }
        },
    };
}