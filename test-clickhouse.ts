// test-clickhouse.ts

import 'dotenv/config';
import clickhouseClient from './src/config/clickhouse';

async function testConnection() {
    try {
        console.log('🔄 Підключаємось до ClickHouse...');

        const result = await clickhouseClient.query({
            query: 'SELECT version()',
            format: 'JSONEachRow',
        });

        const data = await result.json();
        console.log('✅ Підключення успішне!');
        console.log('📊 Версія ClickHouse:', data);

        const databases = await clickhouseClient.query({
            query: 'SHOW DATABASES',
            format: 'JSONEachRow',
        });

        const dbList = await databases.json();
        console.log('📁 Доступні бази даних:', dbList);

        await clickhouseClient.close();
        console.log('✅ З\'єднання закрито');

    } catch (error: any) {
        console.error('❌ Помилка підключення:', error.message);
        console.error('Деталі:', error);
    }
}

testConnection();