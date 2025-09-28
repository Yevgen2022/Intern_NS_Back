import buildApp from "./app";

async function start() {
	const fastify = await buildApp({
		logger: true,
	});

	// const port = fastify.config.PORT;
	// const host = fastify.config.HOST;

    const port = Number(process.env.PORT ?? fastify.config.PORT ?? 3500);
    const host = process.env.HOST ?? fastify.config.HOST ?? "0.0.0.0";


    fastify.listen({ port, host }, (err, address) => {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		console.log(`Server running at ${address}`);
	});
}

void start();
