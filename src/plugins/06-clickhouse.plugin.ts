
import fp from 'fastify-plugin';
import { createClient, ClickHouseClient } from '@clickhouse/client';
// import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        clickhouse: ClickHouseClient;
    }
}

const pluginName = 'clickhouse-plugin';

export default fp(
    async (fastify) => {
        fastify.log.info('ClickHouse Plugin: Loading...');

        const clickhouseClient = createClient({
            url: process.env.CLICKHOUSE_URL || '',
            username: process.env.CLICKHOUSE_USER || 'default',
            password: process.env.CLICKHOUSE_PASSWORD || '',
            database: process.env.CLICKHOUSE_DATABASE || 'default',
        });

        // Перевірка підключення
        try {
            const result = await clickhouseClient.query({
                query: 'SELECT 1',
                format: 'JSONEachRow',
            });
            await result.json();
            fastify.log.info('ClickHouse Plugin: Connected successfully');
        } catch (error) {
            fastify.log.error('ClickHouse Plugin: Connection failed', error);
            throw error;
        }

        // Декорація fastify
        fastify.decorate('clickhouse', clickhouseClient);

        // Graceful shutdown
        fastify.addHook('onClose', async () => {
            await clickhouseClient.close();
            fastify.log.info('ClickHouse Plugin: Connection closed');
        });

        fastify.pluginLoaded?.(pluginName);
    },
    { name: pluginName },
);