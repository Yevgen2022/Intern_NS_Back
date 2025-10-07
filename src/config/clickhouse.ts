import "dotenv/config";
import { createClient } from "@clickhouse/client";





console.log('=== CLICKHOUSE CONFIG ===');
console.log('URL:', process.env.CLICKHOUSE_URL);
console.log('USER:', process.env.CLICKHOUSE_USER);
console.log('DB:', process.env.CLICKHOUSE_DATABASE);
console.log('========================');



const clickhouseClient = createClient({
    url: process.env.CLICKHOUSE_URL || "",
    username: process.env.CLICKHOUSE_USER || "default",
    password: process.env.CLICKHOUSE_PASSWORD || "",
    database: process.env.CLICKHOUSE_DATABASE || "default",
});

export default clickhouseClient;





    // host: process.env.CLICKHOUSE_URL || "",
    // username: process.env.CLICKHOUSE_USER || "default",
    // password: process.env.CLICKHOUSE_PASSWORD || "",
    // database: process.env.CLICKHOUSE_DATABASE || "default",


// host: 'https://at7pcd081l.eu-west-2.aws.clickhouse.cloud:8443',
//     username: 'default',
//     password: 'X0ucLjh_EkyHq',
//     database: 'default',