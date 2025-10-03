import type { Config } from "../config/schema";
import "fastify";

declare module "fastify" {
	interface FastifyInstance {
		config: Config;
		pluginLoaded: (pluginName: string) => void;

		httpErrors: {
			badRequest: (message?: string) => Error;
			unauthorized: (message?: string) => Error;
			forbidden: (message?: string) => Error;
			notFound: (message?: string) => Error;
			internalServerError: (message?: string) => Error;
			conflict: (message?: string) => Error;
			unprocessableEntity: (message?: string) => Error;
			create: (statusCode: number, message?: string) => Error;
		};
	}
}
