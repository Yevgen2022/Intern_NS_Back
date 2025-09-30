import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createAdServerRepo } from "../repository/adServer.repository";
import { findBestLineItem } from "../services/adServer.services";
import type { BidRequest } from "../types/adServer.types";

//   Controller for handling bid requests
//   Accepts a request from the bid adapter and returns a suitable line item

export function adServerController(fastify: FastifyInstance) {
	// Create the repository once during controller initialization
	const repo = createAdServerRepo(fastify);

	return {
		//   POST /api/adserver/bid
		//   Processes a request from the bid adapter

		handleBid: async (req: FastifyRequest, reply: FastifyReply) => {
			try {
				// Extract data from the body (already validated by Fastify)
				const bidRequest = req.body as BidRequest;

				fastify.log.info(
					{ bidRequest },
					"Processing bid request from bid adapter",
				);

				// Call the service to find the best matching line item
				const result = await findBestLineItem(bidRequest, repo);

				// If nothing is found — return 404
				if (!result) {
					fastify.log.info(
						{ bidRequest },
						"No suitable line items found for bid request",
					);
					return reply.code(404).send({
						message: "No suitable line items found",
					});
				}

				// Return the found line item
				fastify.log.info({ result }, "Successfully found line item for bid");
				return reply.code(200).send(result);
			} catch (error) {
				// Log the error
				fastify.log.error(error, "Error processing bid request");

				// Return an error to the client
				return reply.code(500).send({
					error:
						error instanceof Error ? error.message : "Internal server error",
				});
			}
		},
	};
}
