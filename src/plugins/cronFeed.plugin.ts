import fp from "fastify-plugin";
import cron from "node-cron";
import { findAllSources } from "../modules/feedParser/repository/feed.repository";
import { getFeed } from "../modules/feedParser/services/feed.service";

export default fp(
	async (fastify) => {
		const prisma = fastify.prisma; //accept to Prisma from fastify

		//  each 5 minutes
		cron.schedule("*/5 * * * *", async () => {
			fastify.log.info("Running cron job: refresh feeds");

			try {
				// take list of URL from  feeds collection
				const urls = await findAllSources(fastify.prisma);
				if (urls.length === 0) {
					fastify.log.warn("No feed sources found in DB");
					return;
				}

				for (const url of urls) {
					await getFeed(prisma, url, true); // force=true → always is refreshing
				}

				fastify.log.info("Feeds refreshed");
			} catch (err) {
				fastify.log.error(err, "Cron job failed");
			}
		});
	},
	{ name: "cron-feed", dependencies: ["prisma"] },
);
