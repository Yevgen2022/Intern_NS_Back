// import "dotenv/config";
import buildApp from "./app";

async function start() {
	const fastify = await buildApp({
		logger: true,
	});

	const port = Number(process.env.PORT ?? 3500);
	const host = process.env.HOST ?? "0.0.0.0";

	////////////////////////////////////

	{
		const url = process.env.DATABASE_URL ?? "";
		const masked = url.replace(/\/\/([^:]+):[^@]+@/, "//$1:***@");
		console.log("DATABASE_URL (masked) =", masked);
	}

	fastify.get("/health", async () => ({ ok: true }));
	fastify.get("/", async () => ({ ok: true, service: "Intern_NS_Back" }));
	await fastify.ready();
	// console.log(fastify.printRoutes());

	////////////////////////////////////

	fastify.listen({ port, host }, (err, address) => {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		console.log(`Server running at ${address}`);
	});
}

void start();
