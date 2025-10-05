// Import utilities for OpenTelemetry internal diagnostics logging (diag)
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
// Auto-instrumentation for the file system (fs.* operations show up in traces/metrics)
import { FsInstrumentation } from "@opentelemetry/instrumentation-fs";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
// Auto-instrumentation for the MongoDB driver (DB operations show up in traces/metrics)
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
// Import console log exporter and a simple log processor
import {
	ConsoleLogRecordExporter,
	SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
// Import console metric exporter and the reader that periodically exports them
import {
	ConsoleMetricExporter,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
// Import the convenient all-in-one Node.js SDK (manages traces/metrics/logs)
import { NodeSDK } from "@opentelemetry/sdk-node";
// Trace exporter that prints spans to the console (stdout)
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
// FastifyInstance type — used to type the SDK shutdown hook registration
import type { FastifyInstance } from "fastify";
import { logError, logInfo } from "./logger";

type TraceContextFields = {
	trace_id?: string;
	span_id?: string;
	trace_flags?: string;
};

// Export the OpenTelemetry initialization function; return a NodeSDK instance
export async function initOpenTelemetry(): Promise<NodeSDK> {
	// Enable OTEL internal diagnostic logs at INFO level (they will appear in the console)
	diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

	// Create the SDK instance with the required configuration
	const sdk = new NodeSDK({
		// Export traces to the console
		traceExporter: new ConsoleSpanExporter(),

		// Export metrics to the console every 5 seconds
		...(process.env.ENABLE_METRICS === "true" && {
			metricReader: new PeriodicExportingMetricReader({
				exporter: new ConsoleMetricExporter(),
				exportIntervalMillis: 5000,
			}),
		}),

		// Array of log processors
		logRecordProcessors: [
			//sends log records to the console
			new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()),
		],
		// The SDK automatically creates and registers a global LoggerProvider.

		instrumentations: [
			new HttpInstrumentation(),
			new FsInstrumentation(),
			new MongoDBInstrumentation({
				enhancedDatabaseReporting: true,
			}),
			new PinoInstrumentation({
				// trace context for Pino logs
				logHook: (
					span,
					record: Record<string, unknown> & TraceContextFields,
				) => {
					if (!span) return;

					const ctx = span.spanContext();
					record.trace_id = ctx.traceId;
					record.span_id = ctx.spanId;
					record.trace_flags = ctx.traceFlags.toString(16).padStart(2, "0");
				},
			}),
		],
	});

	try {
		await sdk.start();
		console.log("OpenTelemetry initialized successfully");

		// Adding structured log via OpenTelemetry
		logInfo("OpenTelemetry SDK started", {
			"service.name": "fastify-form-app",
			"sdk.version": "0.203.0",
		});
	} catch (err) {
		console.error("OpenTelemetry init failed:", err);
		logError("OpenTelemetry SDK initialization failed", err as Error);
	}
	return sdk;
}

export function registerOtelShutdownHook(app: FastifyInstance, sdk: NodeSDK) {
	// will be executed when Fastify stops
	app.addHook("onClose", async () => {
		await sdk
			.shutdown()
			// If an error occurs during the stop, log it using the Fastify logger.
			.catch((err) => app.log.error("OTEL shutdown failed:", err));
		// Log about successful SDK stop
		app.log.info("OTEL SDK stopped");
	});
}
