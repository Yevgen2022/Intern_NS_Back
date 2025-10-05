import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

//  onReady: logs server readiness
//  onRequest: logs the start of each request (with trace_id)
//  setErrorHandler: logs all errors (with trace_id)

export function registerGlobalHooks(app: FastifyInstance): void {
	app.addHook("onReady", async () => {
		app.log.info("Server is ready");
	});

	app.addHook("onRequest", async (request: FastifyRequest) => {
		request.log.info(
			{
				method: request.method,
				url: request.url,
			},
			"Request started",
		);
	});

	app.setErrorHandler(
		async (error, request: FastifyRequest, reply: FastifyReply) => {
			request.log.error(
				{
					err: error,
					method: request.method,
					url: request.url,
				},
				"Error occurred",
			);
			reply.status(error.statusCode || 500).send({
				error: error.message || "Internal Server Error",
			});
		},
	);
}
