import 'reflect-metadata';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectWithRetry, AppDataSource } from '../config/database';

async function seed() {
    await connectWithRetry();
    const repo = AppDataSource.getRepository(require('../entities/Admin').Admin);
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin1234!';
    if (await repo.findOne({ where: { email } })) { console.log('✅ Admin already exists:', email); process.exit(0); }
    await repo.save(repo.create({ email, password_hash: await bcrypt.hash(password, 12) }));
    console.log(`✅ Admin created: ${email} / ${password}`);
    process.exit(0);
}
seed().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); });
