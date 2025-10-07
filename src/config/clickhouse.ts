import "dotenv/config";
import { createClient } from "@clickhouse/client";

const clickhouseClient = createClient({
    host: 'https://at7pcd081l.eu-west-2.aws.clickhouse.cloud:8443',
    username: 'default',
    password: 'X0ucLjh_EkyHq',
    database: 'default',
});

export default clickhouseClient;


