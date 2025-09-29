// src/adServer/lineItem/lineItem.routes.ts
import type { FastifyInstance } from "fastify";
import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { lineItemController } from "../controllers/lineItem.controllers";
import formHtmlResponse from "../schemas/lineItemsForm.schemas";

export async function lineItemRoutes(fastify: FastifyInstance) {
    const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
    const controller = lineItemController(fastify);

    route.get(
        "/adserver/lineitem/form",
        {
            schema: {
                response: {
                    200: formHtmlResponse, // string, contentMediaType: text/html
                },
                tags: ["adserver", "lineitem"],
                summary: "Render line item creation form (SSR)",
                description: "Generates HTML form on backend and returns it to the client.",
            },
        },
        controller.getForm,
    );
}
