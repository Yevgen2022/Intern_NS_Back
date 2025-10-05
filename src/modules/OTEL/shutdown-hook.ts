import type { NodeSDK } from "@opentelemetry/sdk-node";
import type { FastifyInstance } from "fastify";

export function registerOtelShutdownHook(
	app: FastifyInstance,
	sdk: NodeSDK,
): void {
	app.addHook("onClose", async () => {
		try {
			app.log.info("Shutting down OpenTelemetry SDK...");

			await sdk.shutdown();

			app.log.info("OpenTelemetry SDK stopped successfully");
		} catch (error) {
			app.log.error("Failed to shutdown OpenTelemetry SDK:", error);
		}
	});
}
