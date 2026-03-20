import { Router } from 'express';
import { approveQuestion, rejectQuestion, markAnswered, deleteQuestion, pinQuestion, editQuestion } from '../controllers/questionController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { editQuestionDto } from '../dto/index';

const router = Router();
router.use(authMiddleware);
router.patch('/:id/approve', approveQuestion);
router.patch('/:id/reject', rejectQuestion);
router.patch('/:id/mark-answered', markAnswered);
router.patch('/:id/pin', pinQuestion);
router.patch('/:id/edit', validate(editQuestionDto), editQuestion);
router.delete('/:id', deleteQuestion);
export default router;
