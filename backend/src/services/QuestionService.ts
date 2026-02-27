import { QuestionRepository, EventRepository } from '../repositories/index';
import { Question, QuestionStatus } from '../entities/Question';
import { socketService } from '../sockets/socketService';

export class QuestionService {
    async submitQuestion(eventCode: string, content: string): Promise<Question> {
        const event = await EventRepository.findOne({ where: { event_code: eventCode, is_active: true } });
        if (!event) throw new Error('Event not found or inactive');
        const q = QuestionRepository.create({ event_id: event.id, content, status: QuestionStatus.PENDING, is_visible: false });
        const saved = await QuestionRepository.save(q);
        socketService.emitToAdminRoom(event.id, 'question:new', saved);
        return saved;
    }

    async getQuestionsByEvent(eventId: string, status?: QuestionStatus): Promise<Question[]> {
        const where: Record<string, unknown> = { event_id: eventId };
        if (status) where.status = status;
        return QuestionRepository.find({ where, order: { created_at: 'DESC' } });
    }

    async getDisplayQuestions(eventCode: string): Promise<Question[]> {
        const event = await EventRepository.findOne({ where: { event_code: eventCode } });
        if (!event) throw new Error('Event not found');
        return QuestionRepository.find({
            where: { event_id: event.id, status: QuestionStatus.APPROVED },
            order: { created_at: 'ASC' },
        });
    }

    async approveQuestion(id: string): Promise<Question> {
        const q = await QuestionRepository.findOne({ where: { id }, relations: ['event'] });
        if (!q) throw new Error('Question not found');
        q.status = QuestionStatus.APPROVED;
        q.is_visible = true;
        const saved = await QuestionRepository.save(q);
        socketService.emitToDisplayRoom(q.event.event_code, 'question:visible', saved);
        socketService.emitToAdminRoom(q.event_id, 'question:updated', saved);
        return saved;
    }

    async rejectQuestion(id: string): Promise<Question> {
        const q = await QuestionRepository.findOne({ where: { id }, relations: ['event'] });
        if (!q) throw new Error('Question not found');
        const wasVisible = q.is_visible;
        q.status = QuestionStatus.REJECTED;
        q.is_visible = false;
        const saved = await QuestionRepository.save(q);
        if (wasVisible) socketService.emitToDisplayRoom(q.event.event_code, 'question:hidden', saved);
        socketService.emitToAdminRoom(q.event_id, 'question:updated', saved);
        return saved;
    }

    async markAnswered(id: string): Promise<Question> {
        const q = await QuestionRepository.findOne({ where: { id }, relations: ['event'] });
        if (!q) throw new Error('Question not found');
        if (q.status !== QuestionStatus.APPROVED) throw new Error('Only approved questions can be marked as answered');
        q.status = QuestionStatus.ANSWERED;
        q.is_visible = false;
        const saved = await QuestionRepository.save(q);
        socketService.emitToDisplayRoom(q.event.event_code, 'question:hidden', saved);
        socketService.emitToAdminRoom(q.event_id, 'question:updated', saved);
        return saved;
    }

    async deleteQuestion(id: string): Promise<void> {
        const q = await QuestionRepository.findOne({ where: { id }, relations: ['event'] });
        if (!q) throw new Error('Question not found');
        if (q.status === QuestionStatus.APPROVED && q.is_visible) {
            socketService.emitToDisplayRoom(q.event.event_code, 'question:removed', { id });
        }
        socketService.emitToAdminRoom(q.event_id, 'question:deleted', { id });
        await QuestionRepository.delete(id);
    }
}

export const questionService = new QuestionService();
