// modules/feed/routes.ts
import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { getFeedDataController } from "../controller/feed.controller";
import { schema } from "../schemas/getFeedData.schema";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
	route.get("/feed", { schema }, getFeedDataController);
}

//
// // src/modules/feed/routes/feed.route.ts (або твій файл маршрутів)
// import type { FastifyInstance } from "fastify";
// import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
// import { getFeedDataController } from "../controller/feed.controller";
// import { schema as getFeedDataSchema } from "../schemas/getFeedData.schema";
//
// export async function getFeedDataRoutes(app: FastifyInstance) {
// 	const r = app.withTypeProvider<JsonSchemaToTsProvider>();
//
// 	r.get("/feed", {
// 		schema: getFeedDataSchema,
// 		handler: getFeedDataController,
// 	});
// }
