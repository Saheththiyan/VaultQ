import { Router } from 'express';
import { getEvents, createEvent, deleteEvent } from '../controllers/eventController';
import { getAdminQuestions } from '../controllers/questionController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEventDto } from '../dto';

const router = Router();
router.use(authMiddleware);
router.get('/', getEvents);
router.post('/', validate(createEventDto), createEvent);
router.delete('/:id', deleteEvent);
router.get('/:id/questions', getAdminQuestions);
export default router;
