import helmet from '@fastify/helmet';
import fp from 'fastify-plugin';

const pluginName = 'helmet-plugin';

export default fp(async (fastify) => {
    await fastify.register(helmet, {
        // для API часто вимикають CSP, або налаштовують окремо
        // contentSecurityPolicy: false,
    });
    fastify.pluginLoaded?.(pluginName);
}, { name: pluginName });
