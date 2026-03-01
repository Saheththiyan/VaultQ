jest.mock('../config/database', () => ({ AppDataSource: { getRepository: jest.fn() }, connectWithRetry: jest.fn() }));
jest.mock('../repositories/index', () => ({
    AdminRepository: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
    EventRepository: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
    QuestionRepository: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn(), delete: jest.fn() },
}));
jest.mock('../sockets/socketService', () => ({
    socketService: { emitToAdminRoom: jest.fn(), emitToDisplayRoom: jest.fn() },
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminRepository, EventRepository, QuestionRepository } from '../repositories/index';
import { AuthService } from '../services/AuthService';
import { QuestionService } from '../services/QuestionService';
import { QuestionStatus } from '../entities/Question';

process.env.JWT_SECRET = 'test-secret';

// ─── Auth ────────────────────────────────────────────────────────────────────
describe('AuthService', () => {
    const svc = new AuthService();
    beforeEach(() => jest.clearAllMocks());

    it('returns JWT on valid credentials', async () => {
        const hash = await bcrypt.hash('pass123', 10);
        (AdminRepository.findOne as jest.Mock).mockResolvedValue({ id: 'aid1', email: 'a@b.com', password_hash: hash });
        const token = await svc.login('a@b.com', 'pass123');
        const d = jwt.verify(token, 'test-secret') as { adminId: string };
        expect(d.adminId).toBe('aid1');
    });

    it('throws on wrong password', async () => {
        const hash = await bcrypt.hash('correct', 10);
        (AdminRepository.findOne as jest.Mock).mockResolvedValue({ id: 'aid1', email: 'a@b.com', password_hash: hash });
        await expect(svc.login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('throws when admin not found', async () => {
        (AdminRepository.findOne as jest.Mock).mockResolvedValue(null);
        await expect(svc.login('x@y.com', 'pass')).rejects.toThrow('Invalid credentials');
    });
});

// ─── Question Submission ─────────────────────────────────────────────────────
describe('QuestionService - Submission', () => {
    const svc = new QuestionService();
    beforeEach(() => jest.clearAllMocks());

    it('saves question to an active event', async () => {
        const event = { id: 'eid1', event_code: 'ABC', is_active: true };
        const q = { id: 'qid1', event_id: 'eid1', content: 'What is the plan?', status: QuestionStatus.PENDING, is_visible: false };
        (EventRepository.findOne as jest.Mock).mockResolvedValue(event);
        (QuestionRepository.create as jest.Mock).mockReturnValue(q);
        (QuestionRepository.save as jest.Mock).mockResolvedValue(q);
        const result = await svc.submitQuestion('ABC', 'What is the plan?');
        expect(result.status).toBe(QuestionStatus.PENDING);
        expect(result.is_visible).toBe(false);
    });

    it('throws if event not found', async () => {
        (EventRepository.findOne as jest.Mock).mockResolvedValue(null);
        await expect(svc.submitQuestion('INVALID', 'Hi?')).rejects.toThrow('Event not found or inactive');
    });
});

// ─── Approval Workflow ────────────────────────────────────────────────────────
describe('QuestionService - Approval', () => {
    const svc = new QuestionService();
    const adminId = 'admin-123';
    beforeEach(() => jest.clearAllMocks());

    it('sets status to APPROVED', async () => {
        const q = { id: 'q1', status: QuestionStatus.PENDING, is_visible: false, event_id: 'e1', event: { event_code: 'ABC', admin_id: adminId } };
        (QuestionRepository.findOne as jest.Mock).mockResolvedValue(q);
        (QuestionRepository.save as jest.Mock).mockImplementation((q) => Promise.resolve({ ...q, status: QuestionStatus.APPROVED }));
        const result = await svc.approveQuestion('q1', adminId);
        expect(result.status).toBe(QuestionStatus.APPROVED);
    });

    it('sets status to REJECTED', async () => {
        const q = { id: 'q1', status: QuestionStatus.PENDING, is_visible: false, event_id: 'e1', event: { event_code: 'ABC', admin_id: adminId } };
        (QuestionRepository.findOne as jest.Mock).mockResolvedValue(q);
        (QuestionRepository.save as jest.Mock).mockImplementation((q) => Promise.resolve({ ...q, status: QuestionStatus.REJECTED }));
        const result = await svc.rejectQuestion('q1', adminId);
        expect(result.status).toBe(QuestionStatus.REJECTED);
    });

    it('marks question as answered', async () => {
        const q = { id: 'q1', status: QuestionStatus.APPROVED, is_visible: true, event_id: 'e1', event: { event_code: 'ABC', admin_id: adminId } };
        (QuestionRepository.findOne as jest.Mock).mockResolvedValue(q);
        (QuestionRepository.save as jest.Mock).mockImplementation((q) => Promise.resolve({ ...q, status: QuestionStatus.ANSWERED, is_visible: false }));
        const result = await svc.markAnswered('q1', adminId);
        expect(result.status).toBe(QuestionStatus.ANSWERED);
        expect(result.is_visible).toBe(false);
    });

    it('throws when marking non-approved question as answered', async () => {
        const q = { id: 'q1', status: QuestionStatus.PENDING, is_visible: false, event_id: 'e1', event: { event_code: 'ABC', admin_id: adminId } };
        (QuestionRepository.findOne as jest.Mock).mockResolvedValue(q);
        await expect(svc.markAnswered('q1', adminId)).rejects.toThrow('Only approved questions can be marked as answered');
    });

    it('throws when admin does not own the event', async () => {
        const q = { id: 'q1', status: QuestionStatus.PENDING, is_visible: false, event_id: 'e1', event: { event_code: 'ABC', admin_id: 'different-admin' } };
        (QuestionRepository.findOne as jest.Mock).mockResolvedValue(q);
        await expect(svc.approveQuestion('q1', adminId)).rejects.toThrow('Unauthorized');
    });
});
