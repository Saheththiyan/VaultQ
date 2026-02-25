import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request { adminId?: string; }

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) { res.status(401).json({ error: 'Unauthorized' }); return; }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as { adminId: string };
        req.adminId = decoded.adminId;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
