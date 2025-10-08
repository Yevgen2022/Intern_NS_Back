import cors from "@fastify/cors";
import type {FastifyInstance} from "fastify";
import fp from "fastify-plugin";


// fastify-plugin provides correct typing and allows autoload to work without problems
export default fp(async function corsPlugin(fastify: FastifyInstance) {
    await fastify.register(cors, {
        origin: [
            "http://localhost:5173", // front in dev
            "https://adtelligent-internship.vercel.app", // front on Vercel
            "https://adtelligent-internship-git-main-yevgen2022s-projects.vercel.app", // preview (з Network-скріну)
        ],
        methods: ["GET", "POST", "OPTIONS"],
        // allowedHeaders: ["Content-Type", "Authorization"],
        allowedHeaders: ["*"],
        credentials: true, // cookie-sessions
    });

    fastify.log.info("CORS plugin registered");
});


//
// [
//     "http://localhost:5173", // front in dev
//     "https://adtelligent-internship.vercel.app", // front on Vercel
//     "https://adtelligent-internship-git-main-yevgen2022s-projects.vercel.app", // preview (з Network-скріну)
// ],