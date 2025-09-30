import cookie from "@fastify/cookie";
import fp from "fastify-plugin";

const pluginName = "cookie-plugin";

export default fp(
	async (fastify) => {
		await fastify.register(cookie, {
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
