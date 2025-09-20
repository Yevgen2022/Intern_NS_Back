// import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
// import type { FastifyInstance } from "fastify";
// import { schema } from "../schemas/getFeedData.schema";
//
// export async function getFeedDataRoutes(fastify: FastifyInstance) {
// 	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
//
// 	// route.get(
// 	// 	"/feed",
// 	// 	{
// 	// 		schema: schema,
// 	// 	},
// 	// 	async (request, reply) => {
// 	// 		reply.send({ hello: "feed" });
// 	// 	},
// 	// );
//
// 	route.get("/feed", { schema }, async () => {
// 		return { hello: "feed" };
// 	});
// }
import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { schema } from "../schemas/getFeedData.schema";

// default URL (if the user did not provide one)
const DEFAULT_FEED_URL = "https://feeds.bbci.co.uk/news/rss.xml";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();

	route.get(
		"/feed",
		{ schema },
		async (request, reply) => {
			// get query parameters
			const { url, force } = request.query as {
				url?: string;
				force?: string | number | boolean;
			};

			// якщо url не передано → беремо дефолтний
			const feedUrl = url ?? DEFAULT_FEED_URL;

			// зараз просто повертаємо вибраний URL (пізніше тут буде логіка з БД і парсингом)
			return {
				message: "Feed endpoint",
				url: feedUrl,
				force: force ?? 0,
			};
		},
	);
}
