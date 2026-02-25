import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminRepository } from '../repositories/index';

export class AuthService {
    async login(email: string, password: string): Promise<string> {
        const admin = await AdminRepository.findOne({ where: { email } });
        if (!admin) throw new Error('Invalid credentials');
        const valid = await bcrypt.compare(password, admin.password_hash);
        if (!valid) throw new Error('Invalid credentials');
        return jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET || 'changeme', { expiresIn: '8h' });
    }

    async createAdmin(email: string, password: string): Promise<void> {
        const hash = await bcrypt.hash(password, 12);
        await AdminRepository.save(AdminRepository.create({ email, password_hash: hash }));
    }
}

export const authService = new AuthService();
