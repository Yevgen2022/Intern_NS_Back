import { Config } from "../config/schema";

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
            [key: string]: any;
        }
	}
}
