import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Admin } from '../entities/Admin';
import { Event } from '../entities/Event';
import { Question } from '../entities/Question';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: 'postgres',
    // host: process.env.DB_HOST || 'localhost',
    // port: parseInt(process.env.DB_PORT || '5432'),
    // username: process.env.DB_USER || 'postgres',
    // password: process.env.DB_PASSWORD || 'postgres',
    // database: process.env.DB_NAME || 'qaplatform',
    // synchronize: false,
    url: process.env.DATABASE_URL,
    logging: false,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Enable SSL for production
    entities: [Admin, Event, Question],
    migrations: ['src/migrations/*.ts'],
    poolSize: 10,
    extra: { max: 10, min: 2, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 },
});

export async function connectWithRetry(retries = 10, delay = 3000): Promise<void> {
    console.log('🔌 Connecting to database with config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
    });
    
    for (let i = 0; i < retries; i++) {
        try {
            await AppDataSource.initialize();
            console.log('✅ Database connected');
            return;
        } catch (error) {
            console.log(`⏳ DB not ready, retrying (${i + 1}/${retries})...`);
            if (i === retries - 1) {
                console.error('❌ Connection error:', error);
            }
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    throw new Error('❌ Could not connect to database');
}
