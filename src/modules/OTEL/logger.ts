import { logs } from "@opentelemetry/api-logs";
import { trace, context } from "@opentelemetry/api";

/**
 * Отримати OpenTelemetry Logger для structured logging
 *
 * Використовуйте цей logger замість console.log для того щоб логи
 * потрапляли в OpenTelemetry pipeline і експортувалися разом з трейсами/метриками
 */
export function getOtelLogger() {

    // Запитуємо глобальний LoggerProvider
    const loggerProvider = logs.getLoggerProvider();

    // Отримуємо конкретний logger для нашого сервісу
    return loggerProvider.getLogger('fastify-form-app', '1.0.0');
}

/**
 * Helper функція для швидкого логування
 */
export function logInfo(message: string, attributes?: Record<string, any>) {
    // Отримуємо logger від провайдера
    const logger = getOtelLogger();

    // Отримуємо поточний trace context (якщо є активний span)
    // const activeSpan = trace.getActiveSpan();

    // Створюємо лог запис
    logger.emit({
        severityText: 'INFO',      // рівень логу
        severityNumber: 9,         // числове значення INFO
        body: message,             // текст повідомлення
        attributes: attributes,    // додаткові дані
        context: context.active(), // прив'язка до trace
    });
}


export function logError(message: string, error?: Error, attributes?: Record<string, any>) {
    const logger = getOtelLogger();
    logger.emit({
        severityText: 'ERROR',
        severityNumber: 17, // ERROR = 17
        body: message,
        attributes: {
            ...attributes,
            'error.message': error?.message,
            'error.stack': error?.stack,
        },
        context: context.active()  //Для трейсів
    });
}

export function logWarn(message: string, attributes?: Record<string, any>) {
    const logger = getOtelLogger();
    logger.emit({
        severityText: 'WARN',
        severityNumber: 13, // WARN = 13
        body: message,
        attributes: attributes || {},
    });
}

export function logDebug(message: string, attributes?: Record<string, any>) {
    const logger = getOtelLogger();
    logger.emit({
        severityText: 'DEBUG',
        severityNumber: 5, // DEBUG = 5
        body: message,
        attributes: attributes || {},
    });
}