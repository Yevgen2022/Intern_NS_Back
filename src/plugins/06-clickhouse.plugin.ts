import { type ClickHouseClient, createClient } from "@clickhouse/client";
import fp from "fastify-plugin";

declare module "fastify" {
	interface FastifyInstance {
		clickhouse: ClickHouseClient;
	}
}

const pluginName = "clickhouse-plugin";

export default fp(
	async (fastify) => {
		fastify.log.info("ClickHouse Plugin: Loading...");


        if (!process.env.CLICKHOUSE_URL) {
            fastify.log.warn("ClickHouse URL not configured, skipping plugin");
            return;
        }

		const clickhouseClient = createClient({
            url: process.env.CLICKHOUSE_URL,
			username: process.env.CLICKHOUSE_USER || "default",
			password: process.env.CLICKHOUSE_PASSWORD || "",
			database: process.env.CLICKHOUSE_DATABASE || "default",
		});

		//Checking the connection
		try {
			const result = await clickhouseClient.query({
				query: "SELECT 1",
				format: "JSONEachRow",
			});
			await result.json();
			fastify.log.info("ClickHouse Plugin: Connected successfully");
		} catch (error) {
			fastify.log.error("ClickHouse Plugin: Connection failed", error);
			throw error;
		}

		fastify.decorate("clickhouse", clickhouseClient);

		// Graceful shutdown
		fastify.addHook("onClose", async () => {
			await clickhouseClient.close();
			fastify.log.info("ClickHouse Plugin: Connection closed");
		});

		fastify.pluginLoaded?.(pluginName);
	},
	{ name: pluginName },
);
