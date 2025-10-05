// modules/OTEL/index.ts
export { initOpenTelemetry } from "./otel";
export { registerOtelShutdownHook } from "./shutdown-hook";
export { getOtelLogger, logInfo, logError, logWarn, logDebug } from "./logger";