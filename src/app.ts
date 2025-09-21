import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config";

import { getFeedDataRoutes } from "./modules/feedParser/routes/feedParser.route";

export type AppOptions = Partial<FastifyServerOptions>;

async function buildApp(options: AppOptions = {}) {
	const fastify = Fastify({ logger: true }); //create server Turns on the built-in logger.
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

	return fastify;
}

export default buildApp;
