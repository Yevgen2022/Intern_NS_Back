import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { lineItemController } from "../controllers/lineItem.controllers";
import {
	// creativeForSave,
	formHtmlResponse,
} from "../schemas/lineItemsForm.schemas"; //

export async function lineItemRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
	const controller = lineItemController(fastify);

	// route.get(
	//     "/adserver/lineitem/form",
	//     {
	//         schema: {
	//             response: {
	//                 200: formHtmlResponse,
	//             },
	//             tags: ["adserver", "lineitem"],
	//             summary: "Render line item creation form (SSR)",
	//             description:
	//                 "Generates HTML form on backend and returns it to the client.",
	//         },
	//     },
	//     controller.getForm,
	// );

	route.get(
		"/adserver/lineitem/form",
		{
			schema: {
				tags: ["adserver", "lineitem"],
				summary: "Render line item creation form (SSR)",
				description:
					"Generates HTML form on backend and returns it to the client.",
				response: {
					200: formHtmlResponse, // ← валідація/документація відповіді
				},
			},
		},
		controller.getForm, // ← бізнес-логіка не змінюється
	);

	route.post(
		"/adserver/lineitem/save",
		{
			schema: {
				hide: true,
				tags: ["adserver", "lineitem"],
				summary: "Create new line item with creative",
				description:
					"Upload creative file and create line item with targeting parameters.",
			},
		},
		controller.saveCreative,
	);
}
