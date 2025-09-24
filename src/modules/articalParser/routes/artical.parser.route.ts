// modules/parse/artical.parse.route.ts
import type {JsonSchemaToTsProvider} from "@fastify/type-provider-json-schema-to-ts";
import {FastifyInstance} from "fastify";
import {parseArticleController} from "../controllers/artical.parse.controller";

import {
    parseArticleBody,
    parseArticleResponse,
} from "../schema/artical.parser.schema"


export async function parseRoutes(fastify: FastifyInstance) {
    const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
    const controller = parseArticleController(fastify);


    route.post(
        "/parse",
        {schema: {body: parseArticleBody, response: {200: parseArticleResponse}}},
        controller.parseArticleController,
    );



}


//handler: async (req, reply) => {
//     const { url } = req.query as { url: string };
//
//     // 🔹 тимчасова заглушка (сервіс буде пізніше)
//     return {
//         sourceUrl: url,
//         title: "Demo title",
//         author: null,
//         publishedAt: null,
//         content: "Demo content",
//         images: [],
//         links: [],
//     };
// },