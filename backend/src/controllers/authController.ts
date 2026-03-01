import { Request, Response } from 'express';
import { authService } from '../services/AuthService';

export const adminSignup = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = await authService.signup(req.body.email, req.body.password);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('admin_token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 8 * 3600 * 1000 });
        res.status(201).json({ message: 'Signup successful', token });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Signup failed';
        const status = message === 'Email already exists' ? 409 : 400;
        res.status(status).json({ error: message });
    }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = await authService.login(req.body.email, req.body.password);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('admin_token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 8 * 3600 * 1000 });
        res.json({ message: 'Login successful', token });
    } catch { res.status(401).json({ error: 'Invalid credentials' }); }
};

export const adminLogout = (_req: Request, res: Response): void => {
    res.clearCookie('admin_token');
    res.json({ message: 'Logged out' });
};

export const adminMe = (req: Request & { adminId?: string }, res: Response): void => {
    res.json({ adminId: req.adminId });
};
