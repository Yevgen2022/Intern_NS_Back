import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import multipart from "@fastify/multipart";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config";
import { lineItemRoutes } from "./modules/AddServer/lineItem/routes/lineItem.routes";
import { adServerRoutes } from "./modules/AddServer/server/routes/adServer.routes";
import { analyticsRoutes } from "./modules/analytics/routes/analytics.routes";
import { parseRoutes } from "./modules/articalParser/routes/artical.parser.route";
import { authRoutes } from "./modules/auth/routes/auth.routes";
import { getFeedDataRoutes } from "./modules/feedParser/routes/feedParser.route";
import {initOpenTelemetry, registerOtelShutdownHook, logInfo, logError} from "./modules/OTEL";

export type AppOptions = Partial<FastifyServerOptions>;



async function buildApp(options: AppOptions = {}) {

    const sdk = await initOpenTelemetry();
	const fastify = Fastify({ logger: true }); //create server Turns on the built-in logger.


    registerOtelShutdownHook(fastify, sdk);
    // Додаємо hook для логування запитів
    fastify.addHook('onRequest', async (request, reply) => {
        logInfo('HTTP request received', {
            'http.method': request.method,
            'http.url': request.url,
            'http.user_agent': request.headers['user-agent'],
        });
    });

    fastify.addHook('onResponse', async (request, reply) => {
        logInfo('HTTP response sent', {
            'http.method': request.method,
            'http.url': request.url,
            'http.status_code': reply.statusCode,
        });
    });

    // Логування помилок
    fastify.setErrorHandler((error, request, reply) => {
        logError('Request error occurred', error, {
            'http.method': request.method,
            'http.url': request.url,
        });

        reply.status(500).send({ error: 'Internal Server Error' });
    });








	await fastify.register(multipart, {
		attachFieldsToBody: true,
		limits: {
			fileSize: 5 * 1024 * 1024, // 5MB
			files: 1,
		},
	});

	await fastify.register(configPlugin); //Connects your config plugin

	try {
		fastify.decorate("pluginLoaded", (pluginName: string) => {
			//Adds a utility for logging downloaded plugins
			fastify.log.info(`Plugin loaded: ${pluginName}`);
		});

		fastify.log.info("Starting to load plugins");
		await fastify.register(AutoLoad, {
			//Autoloads plugins from the plugins/ folder
			dir: join(__dirname, "plugins"),
			options: options,
			ignorePattern: /^((?!plugin).)*$/, // load only files whose PATH contains "plugin"
		});

		fastify.log.info("Plugins loaded successfully");
	} catch (error) {
		fastify.log.error("Error in autoload:", error);
		throw error;
	}



	fastify.register(getFeedDataRoutes);
	fastify.register(authRoutes, { prefix: "/api" });
	fastify.register(parseRoutes, { prefix: "/api" });
	fastify.register(lineItemRoutes, { prefix: "/api" });
	fastify.register(adServerRoutes, { prefix: "/api" });
	fastify.register(analyticsRoutes, { prefix: "/api/analytics" });
	return fastify;
}

export default buildApp;
