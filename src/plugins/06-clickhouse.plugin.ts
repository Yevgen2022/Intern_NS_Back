// src/plugins/clickhouse.plugin.ts

import fp from 'fastify-plugin';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        clickhouse: ClickHouseClient;
    }
}

const clickhousePlugin: FastifyPluginAsync = async (fastify, options) => {
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
        fastify.log.info('ClickHouse connected successfully');
    } catch (error) {
        fastify.log.error('ClickHouse connection failed:', error);
        throw error;
    }

    fastify.decorate('clickhouse', clickhouseClient);

    fastify.addHook('onClose', async () => {
        await clickhouseClient.close();
        fastify.log.info('ClickHouse connection closed');
    });

    fastify.pluginLoaded('clickhouse');
};

export default fp(clickhousePlugin, {
    name: 'clickhouse-plugin',
});