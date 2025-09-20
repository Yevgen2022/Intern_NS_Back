import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { schema } from "../schemas/getFeedData.schema";
import { getFeedDataController } from "../controller/feedController";

// default URL (if the user did not provide one)
const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get("/feed", { schema }, getFeedDataController);
}