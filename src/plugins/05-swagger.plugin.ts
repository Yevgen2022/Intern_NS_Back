import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fp from "fastify-plugin";

export default fp(async (app) => {
	await app.register(swagger, {
		openapi: {
			openapi: "3.0.3",
			info: {
				title: "Intern_NS_Back API",
				version: "1.0.0",
				description: "RSS parsing and authentication API",
			},
			servers: [
				{
					url: "https://internnsback-production.up.railway.app",
					description: "Production (Railway)",
				},
				{ url: "http://localhost:3500", description: "Local dev" },
			],
			components: {
				securitySchemes: {
					cookieAuth: { type: "apiKey", in: "cookie", name: "session" },
				},
				schemas: {}, // routes with their own schemas
			},
		},
	});

	await app.register(swaggerUI, {
		routePrefix: "/docs",
		uiConfig: { docExpansion: "list", deepLinking: true },
		staticCSP: true,
	});
});
