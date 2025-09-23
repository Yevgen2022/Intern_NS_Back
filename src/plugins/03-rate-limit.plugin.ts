import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

const pluginName = "rate-limit-plugin";

export default fp(
	async (fastify) => {
		// register, but disable limits
		await fastify.register(rateLimit, {
			global: false, // do not apply to all routes
			max: Number.MAX_SAFE_INTEGER, // conditionally “without limit”
			timeWindow: "1 hour",
		});

		fastify.pluginLoaded?.(pluginName);
	},
	{ name: pluginName },
);
