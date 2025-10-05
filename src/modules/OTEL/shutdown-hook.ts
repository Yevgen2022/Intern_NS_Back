import type { FastifyInstance } from "fastify";
import type { NodeSDK } from "@opentelemetry/sdk-node";

/**
 * Реєструє Fastify хук для graceful shutdown OpenTelemetry SDK
 *
 * Цей хук викликається при закритті Fastify сервера і забезпечує:
 * - Завершення всіх активних spans
 * - Експорт залишкових метрик та логів
 * - Закриття з'єднань з експортерами
 * - Коректну зупинку всіх провайдерів
 *
 * @param app - інстанс Fastify сервера
 * @param sdk - інстанс OpenTelemetry NodeSDK
 */
export function registerOtelShutdownHook(
    app: FastifyInstance,
    sdk: NodeSDK
): void {
    app.addHook("onClose", async () => {
        try {
            app.log.info("Shutting down OpenTelemetry SDK...");

            // Викликаємо shutdown для коректної зупинки всіх провайдерів
            await sdk.shutdown();

            app.log.info("OpenTelemetry SDK stopped successfully");
        } catch (error) {
            app.log.error("Failed to shutdown OpenTelemetry SDK:", error);

            // Не викидаємо помилку далі, щоб не блокувати shutdown сервера
            // Логуємо та продовжуємо процес зупинки
        }
    });
}