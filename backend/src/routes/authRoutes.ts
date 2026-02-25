import { Router } from 'express';
import { adminLogin, adminLogout, adminMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { loginDto } from '../dto';

const router = Router();
router.post('/login', loginRateLimiter, validate(loginDto), adminLogin);
router.post('/logout', adminLogout);
router.get('/me', authMiddleware, adminMe);
export default router;
