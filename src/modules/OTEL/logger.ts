import { context } from "@opentelemetry/api";
import { type AnyValueMap, type Logger, logs } from "@opentelemetry/api-logs";

// Get the OpenTelemetry Logger for structured logging
// Use this logger ONLY outside the HTTP context:
// - Background jobs (cron tasks)
// - CLI scripts
// - Startup/shutdown logic
// For HTTP requests use request.log or fastify.log (Pino)
export function getOtelLogger(): Logger {
	// You can also call logs.getLogger('fastify-form-app') directly;
	// using the provider explicitly is also fine.
	const provider = logs.getLoggerProvider();
	return provider.getLogger("fastify-form-app", "1.0.0");
}

export function logInfo(message: string, attributes?: AnyValueMap): void {
	const logger = getOtelLogger();
	logger.emit({
		severityText: "INFO",
		severityNumber: 9,
		body: message,
		attributes,
		context: context.active(),
	});
}

export function logError(
	message: string,
	error?: Error,
	attributes?: AnyValueMap,
): void {
	const logger = getOtelLogger();

	// Build attributes map without undefined values
	const attrs: AnyValueMap = { ...(attributes ?? {}) };
	if (error?.message) attrs["error.message"] = error.message;
	if (error?.stack) attrs["error.stack"] = error.stack;

	logger.emit({
		severityText: "ERROR",
		severityNumber: 17,
		body: message,
		attributes: Object.keys(attrs).length ? attrs : undefined,
		context: context.active(),
	});
}

export function logWarn(message: string, attributes?: AnyValueMap): void {
	const logger = getOtelLogger();
	logger.emit({
		severityText: "WARN",
		severityNumber: 13,
		body: message,
		attributes,
		context: context.active(),
	});
}

export function logDebug(message: string, attributes?: AnyValueMap): void {
	const logger = getOtelLogger();
	logger.emit({
		severityText: "DEBUG",
		severityNumber: 5,
		body: message,
		attributes,
		context: context.active(),
	});
}
