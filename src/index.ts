// import "dotenv/config";


// console.log('=== RAILWAY ENV CHECK ===');
// console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('CLICK')));
// console.log('CLICKHOUSE_URL:', process.env.CLICKHOUSE_URL);
// console.log('CLICKHOUSE_USER:', process.env.CLICKHOUSE_USER);
// console.log('CLICKHOUSE_PASSWORD:', process.env.CLICKHOUSE_PASSWORD ? '***SET***' : 'NOT SET');
// console.log('CLICKHOUSE_DATABASE:', process.env.CLICKHOUSE_DATABASE);
// console.log('========================');

(function envSnapshot() {
    const keys = Object.keys(process.env).filter(k =>
        k.startsWith('CLICKHOUSE_') || k === 'RAILWAY_SERVICE_CLICKHOUSE_URL'
    );
    console.log('=== CH ENV SNAPSHOT ===');
    console.log('Keys:', keys);
    console.log('CLICKHOUSE_URL:', process.env.CLICKHOUSE_URL);
    console.log('CLICKHOUSE_USER:', process.env.CLICKHOUSE_USER);
    console.log('CLICKHOUSE_DATABASE:', process.env.CLICKHOUSE_DATABASE);
    console.log('========================');
})();

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
