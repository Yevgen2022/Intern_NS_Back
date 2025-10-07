import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import { createAuthController } from "../controllers/auth.controllers";
import {
	// basicOk,
	errorWhoamiResponse,
	loginBody,
	loginResponse,
	logoutResponse,
	registerBody,
	registerResponse,
	whoamiResponse,
} from "../schemas/auth.schema";

export async function authRoutes(fastify: FastifyInstance) {
	const route = fastify.withTypeProvider<JsonSchemaToTsProvider>();
	const controller = createAuthController(fastify);

	route.post(
		"/register",
		{ schema: { body: registerBody, response: { 201: registerResponse } } },
		controller.register,
	);

	route.post(
		"/login",
		{ schema: { body: loginBody, response: { 200: loginResponse } } },
		controller.login,
	);

	route.post(
		"/logout",
		{
			schema: {
				tags: ["auth"],
				summary: "Logout current user and clear session cookie",
				response: { 200: logoutResponse },
			},
		},
		controller.logout,
	);

	route.get(
		"/whoami",
		{ schema: { response: { 200: whoamiResponse, 401: errorWhoamiResponse } } },
		controller.whoami,
	);
}
