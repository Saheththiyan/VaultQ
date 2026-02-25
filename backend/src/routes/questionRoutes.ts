import { Router } from 'express';
import { approveQuestion, rejectQuestion, toggleVisibility, deleteQuestion } from '../controllers/questionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.patch('/:id/approve', approveQuestion);
router.patch('/:id/reject', rejectQuestion);
router.patch('/:id/toggle-visibility', toggleVisibility);
router.delete('/:id', deleteQuestion);
export default router;
