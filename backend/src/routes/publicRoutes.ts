import { Router } from 'express';
import { submitQuestion, getDisplayQuestions } from '../controllers/questionController';
import { getEventByCode } from '../controllers/eventController';
import { questionRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { submitQuestionDto } from '../dto';

const router = Router();
router.get('/:eventCode', getEventByCode);
router.post('/:eventCode/questions', questionRateLimiter, validate(submitQuestionDto), submitQuestion);
router.get('/:eventCode/display', getDisplayQuestions);
export default router;
