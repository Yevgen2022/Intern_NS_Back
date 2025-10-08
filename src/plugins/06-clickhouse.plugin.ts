// import { type ClickHouseClient, createClient } from "@clickhouse/client";
// import fp from "fastify-plugin";
//
// declare module "fastify" {
// 	interface FastifyInstance {
// 		clickhouse: ClickHouseClient;
// 	}
// }
//
// const pluginName = "clickhouse-plugin";
//
// export default fp(
// 	async (fastify) => {
// 		fastify.log.info("ClickHouse Plugin: Loading...");
//
// 		const clickhouseClient = createClient({
//             url: process.env.CLICKHOUSE_URL,
// 			username: process.env.CLICKHOUSE_USER || "default",
// 			password: process.env.CLICKHOUSE_PASSWORD || "",
// 			database: process.env.CLICKHOUSE_DATABASE || "default",
// 		});
//
// 		//Checking the connection
// 		try {
// 			const result = await clickhouseClient.query({
// 				query: "SELECT 1",
// 				format: "JSONEachRow",
// 			});
// 			await result.json();
// 			fastify.log.info("ClickHouse Plugin: Connected successfully");
// 		} catch (error) {
// 			fastify.log.error("ClickHouse Plugin: Connection failed", error);
// 			throw error;
// 		}
//
// 		fastify.decorate("clickhouse", clickhouseClient);
//
// 		// Graceful shutdown
// 		fastify.addHook("onClose", async () => {
// 			await clickhouseClient.close();
// 			fastify.log.info("ClickHouse Plugin: Connection closed");
// 		});
//
// 		fastify.pluginLoaded?.(pluginName);
// 	},
// 	{ name: pluginName },
// );



// plugins/clickhouse.ts
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

        // ОТУТ ставимо фолбек на Railway-змінну
        const rawBase =
            (process.env.CLICKHOUSE_URL ||
                process.env.RAILWAY_SERVICE_CLICKHOUSE_URL ||
                "").trim();

        const username = (process.env.CLICKHOUSE_USER || "default").trim();
        const password = (process.env.CLICKHOUSE_PASSWORD || "").trim();
        const database = (process.env.CLICKHOUSE_DATABASE || "default").trim();

        if (!rawBase) {
            fastify.log.warn(
                "ClickHouse URL not set (CLICKHOUSE_URL or RAILWAY_SERVICE_CLICKHOUSE_URL). Skipping."
            );
            return;
        }

        // Валідний базовий URL (без /db у кінці)
        let base: URL;
        try {
            base = new URL(rawBase);
        } catch {
            fastify.log.error({ rawBase }, "ClickHouse URL is invalid. Skipping.");
            return;
        }

        // Щоб не було варну "database is overridden",
        // НЕ додаємо /default у URL, а передаємо database окремо.
        const finalUrl = base.origin;
        fastify.log.info(
            { url: finalUrl },
            "ClickHouse Plugin: Final URL (no creds in log)"
        );

        const clickhouseClient = createClient({
            url: finalUrl,       // напр. https://host:8443
            username,            // default
            password,            // твій пароль
            database,            // default
        });

        // Легка перевірка з’єднання (сервер не падає, якщо тут фейл)
        try {
            const result = await clickhouseClient.query({
                query: "SELECT 1",
                format: "JSONEachRow",
            });
            await result.json();
            fastify.log.info("ClickHouse Plugin: Connected successfully");
        } catch (error) {
            fastify.log.warn(
                { err: (error as Error).message },
                "ClickHouse Plugin: Initial query failed (server continues)"
            );
        }

        fastify.decorate("clickhouse", clickhouseClient);

        fastify.addHook("onClose", async () => {
            try { await clickhouseClient.close(); } finally {
                fastify.log.info("ClickHouse Plugin: Connection closed");
            }
        });

        fastify.pluginLoaded?.(pluginName);
    },
    { name: pluginName }
);
