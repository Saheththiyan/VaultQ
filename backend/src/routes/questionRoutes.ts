import { Router } from 'express';
import { approveQuestion, rejectQuestion, markAnswered, deleteQuestion } from '../controllers/questionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.patch('/:id/approve', approveQuestion);
router.patch('/:id/reject', rejectQuestion);
router.patch('/:id/mark-answered', markAnswered);
router.delete('/:id', deleteQuestion);
export default router;
