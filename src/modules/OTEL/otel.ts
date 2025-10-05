// import {diag, DiagLogLevel, DiagConsoleLogger} from "@opentelemetry/api";
// import {NodeSDK} from "@opentelemetry/sdk-node";
// import {ConsoleSpanExporter} from "@opentelemetry/sdk-trace-node";
// import {ConsoleMetricExporter} from "@opentelemetry/sdk-metrics";
// import {ConsoleLogRecordExporter, SimpleLogRecordProcessor} from "@opentelemetry/sdk-logs";
// import {FastifyOtelInstrumentation} from "@fastify/otel";
// import {FsInstrumentation} from "@opentelemetry/instrumentation-fs";
// import {MongoDBInstrumentation} from "@opentelemetry/instrumentation-mongodb";
//
//
// export async function initOpenTelemetry() {
//     diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)
//     const sdk = new NodeSDK({
//         traceExporter: new ConsoleSpanExporter(),
//         metricExporter: new ConsoleMetricExporter(),
//         logRecordProcessors: [
//             new SimpleLogRecordProcessor(
//                 new ConsoleLogRecordExporter()
//             ),
//         ],
//         instrumentations: [
//             new FastifyOtelInstrumentation({
//                 serviceName: 'fastify-form-app',
//                 registerOnInitialization: true,
//                 ignoreRoutes: (opts) => {
//                     return opts.url.includes("/health");
//                 },
//             }),
//             new FsInstrumentation(),
//             new MongoDBInstrumentation({enhancedDatabaseReporting: true}),
//         ],
//         "service.name": 'fastify-form-app',
//         "service.version": "1.0.0",
//         "service.environment": "development",
//         "service.instance.id": "instance-1"
//     })
//
//     try {
//          sdk.start();
//         console.log("Starting connection...");
//     } catch (err) {
//         console.error("Failed to start connection...:,");
//     }
//     return sdk;
// }



// Імпортуємо утиліти для внутрішнього логування самого OpenTelemetry (diag)
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// Імпортуємо зручний комбінований SDK для Node.js (керує трейсами/метриками/логами)
import { NodeSDK } from "@opentelemetry/sdk-node";

// Експортер трейсів, який виводить спани у консоль (stdout)
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";

// Імпортуємо консольний експортер метрик та рідер, що періодично їх відправляє
import { ConsoleMetricExporter, PeriodicExportingMetricReader} from "@opentelemetry/sdk-metrics";

// Імпортуємо консольний експортер логів та простий процесор логів
import { ConsoleLogRecordExporter, SimpleLogRecordProcessor} from "@opentelemetry/sdk-logs";

// Авто-інструментація файлової системи (fs.* операції потрапляють у трейси/метрики)
import { FsInstrumentation } from "@opentelemetry/instrumentation-fs";

// Авто-інструментація драйвера MongoDB (запити до БД потрапляють у трейси/метрики)
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";

// Тип FastifyInstance — щоб типізувати реєстрацію хука вимкнення SDK
import type { FastifyInstance } from "fastify";

import { logInfo, logError } from "./logger";


// Експортуємо функцію ініціалізації OpenTelemetry; повертаємо інстанс NodeSDK
export async function initOpenTelemetry(): Promise<NodeSDK> {

    // Вмикаємо внутрішні діагностичні логи OTEL на рівні INFO (будуть у консолі)
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

    // Створюємо екземпляр SDK із потрібною конфігурацією
    const sdk = new NodeSDK({


        // Трейси експортуємо у консоль (для простого дебагу)
        traceExporter: new ConsoleSpanExporter(),


        // Метрики експортуються у консоль кожні 5 секунд через періодичний рідер
        metricReader: new PeriodicExportingMetricReader({
            // Власне експортер метрик — консоль
            exporter: new ConsoleMetricExporter(),
            // Інтервал експорту (мс)
            exportIntervalMillis: 5000,
        }),


        // Масив процесорів логів (у цій версії SDK — множина)
        logRecordProcessors: [
            // Простий процесор, що надсилає лог-записи у консоль
            new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
        ],
       // SDK автоматично створив і зареєстрував глобальний LoggerProvider.


        // Підключаємо авто-інструментації (мінімально: FS та MongoDB)
        instrumentations: [

            // Інструментація файлової системи (читання/запис файлів)
            new FsInstrumentation(),

            // Інструментація MongoDB; ввімкнено детальніший репортинг
            new MongoDBInstrumentation({
                enhancedDatabaseReporting: true
            }),
        ],

        // Примітка: атрибути ресурсу (service.name тощо) можна додати через поле `resource`
        // за допомогою resourceFromAttributes(...) — опущено тут для простоти.
    });


    try {
        // Стартуємо SDK (реєструє провайдери та вмикає інструментації)
        await sdk.start();
        // Лог про успішну ініціалізацію
        console.log("OpenTelemetry initialized successfully");

// Додаємо structured log через OpenTelemetry
        logInfo('OpenTelemetry SDK started', {
            'service.name': 'fastify-form-app',
            'sdk.version': '0.203.0',
        });



    } catch (err) {
        // Якщо щось пішло не так при старті — покажемо помилку
        console.error("OpenTelemetry init failed:", err);

        // Логуємо помилку через OpenTelemetry
        logError('OpenTelemetry SDK initialization failed', err as Error);
    }

    // Повертаємо SDK назовні (щоб пізніше коректно викликати shutdown)
    return sdk;
}

// Експортуємо утиліту, що прив’язує коректне вимкнення OTEL до життєвого циклу Fastify
export function registerOtelShutdownHook(app: FastifyInstance, sdk: NodeSDK) {
    // Додаємо хук onClose: виконається при зупинці Fastify
    app.addHook("onClose", async () => {
        // Коректно зупиняємо SDK (злив буферів, закриття експортерів)
        await sdk
            .shutdown()
            // Якщо при зупинці сталася помилка — логнемо її через логер Fastify
            .catch((err) => app.log.error("OTEL shutdown failed:", err));

        // Лог про успішну зупинку SDK
        app.log.info("OTEL SDK stopped");
    });
}
