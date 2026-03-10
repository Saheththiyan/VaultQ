import { Router } from 'express';
import { approveQuestion, rejectQuestion, markAnswered, deleteQuestion, pinQuestion } from '../controllers/questionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.patch('/:id/approve', approveQuestion);
router.patch('/:id/reject', rejectQuestion);
router.patch('/:id/mark-answered', markAnswered);
router.patch('/:id/pin', pinQuestion);
router.delete('/:id', deleteQuestion);
export default router;
