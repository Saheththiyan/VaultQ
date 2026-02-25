import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Admin } from '../entities/Admin';
import { Event } from '../entities/Event';
import { Question } from '../entities/Question';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'qaplatform',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [Admin, Event, Question],
    migrations: ['src/migrations/*.ts'],
    poolSize: 10,
    extra: { max: 10, min: 2, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 },
});

export async function connectWithRetry(retries = 10, delay = 3000): Promise<void> {
    for (let i = 0; i < retries; i++) {
        try {
            await AppDataSource.initialize();
            console.log('✅ Database connected');
            return;
        } catch {
            console.log(`⏳ DB not ready, retrying (${i + 1}/${retries})...`);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    throw new Error('❌ Could not connect to database');
}
