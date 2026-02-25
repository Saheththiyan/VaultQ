import 'reflect-metadata';
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { connectWithRetry, AppDataSource } from '../config/database';
import { Admin } from '../entities/Admin';

async function seed() {
    try {
        await connectWithRetry();
        console.log('✅ Database connected');
        
        const repo = AppDataSource.getRepository(Admin);
        const email = process.env.ADMIN_EMAIL || 'admin@example.com';
        const password = process.env.ADMIN_PASSWORD || 'Admin1234!';
        
        console.log(`🔍 Checking for existing admin: ${email}`);
        await repo.delete({ email });
        console.log('🗑️  Deleted any existing admin');
        
        console.log('🔐 Hashing password...');
        const passwordHash = bcrypt.hashSync(password, 12);
        console.log('✅ Password hashed');
        
        console.log('💾 Creating admin user...');
        const admin = repo.create({ 
            email, 
            password_hash: passwordHash 
        });
        
        await repo.save(admin);
        console.log(`✅ Admin created successfully: ${email} / ${password}`);
        
        const count = await repo.count();
        console.log(`📊 Total admins in database: ${count}`);
        
        process.exit(0);
    } catch (e) {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    }
}

seed();