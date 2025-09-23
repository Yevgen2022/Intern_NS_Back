import cookie from "@fastify/cookie";
import fp from "fastify-plugin";

const pluginName = "cookie-plugin";

export default fp(
	async (fastify) => {
		await fastify.register(cookie, {
			// приклад дефолтів для твого Auth
			parseOptions: {
				sameSite: "lax",
				httpOnly: true,
				path: "/",
				secure: false,
			},
		});
		fastify.pluginLoaded?.(pluginName);
	},
	{ name: pluginName },
);
