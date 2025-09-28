import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";

// fastify-plugin provides correct typing and allows autoload to work without problems
export default fp(async function corsPlugin(fastify: FastifyInstance) {
    await fastify.register(cors, {
        origin: "http://localhost:5173", // front in dev
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
         credentials: true, // cookie-sessions
    });

    fastify.log.info("CORS plugin registered");
});
