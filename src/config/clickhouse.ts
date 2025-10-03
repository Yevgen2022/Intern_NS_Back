import "dotenv/config";
import { createClient } from "@clickhouse/client";

const clickhouseClient = createClient({
	host: process.env.CLICKHOUSE_URL || "",
	username: process.env.CLICKHOUSE_USER || "default",
	password: process.env.CLICKHOUSE_PASSWORD || "",
	database: process.env.CLICKHOUSE_DATABASE || "default",
});

export default clickhouseClient;
