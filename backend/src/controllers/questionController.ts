import { Request, Response } from 'express';
import { questionService } from '../services/QuestionService';
import { QuestionStatus } from '../entities/Question';

const handleErr = (res: Response, err: unknown, fallbackStatus = 500): void => {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    const status = msg.includes('not found') ? 404 : msg.includes('Only approved') ? 400 : msg.includes('Unauthorized') ? 403 : fallbackStatus;
    res.status(status).json({ error: msg });
};

export const submitQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = await questionService.submitQuestion(req.params.eventCode, req.body.content);
        res.status(201).json({ message: 'Question submitted successfully', id: q.id });
    } catch (err) { handleErr(res, err); }
};

export const getDisplayQuestions = async (req: Request, res: Response): Promise<void> => {
    try { res.json(await questionService.getDisplayQuestions(req.params.eventCode)); }
    catch (err) { handleErr(res, err); }
};

export const getAdminQuestions = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try {
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        const status = Object.values(QuestionStatus).includes(req.query.status as QuestionStatus)
            ? (req.query.status as QuestionStatus) : undefined;
        res.json(await questionService.getQuestionsByEvent(req.params.id, req.adminId, status));
    } catch (err) { handleErr(res, err); }
};

export const approveQuestion = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try { 
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        res.json(await questionService.approveQuestion(req.params.id, req.adminId)); 
    }
    catch (err) { handleErr(res, err); }
};

export const rejectQuestion = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try { 
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        res.json(await questionService.rejectQuestion(req.params.id, req.adminId)); 
    }
    catch (err) { handleErr(res, err); }
};

export const markAnswered = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try { 
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        res.json(await questionService.markAnswered(req.params.id, req.adminId)); 
    }
    catch (err) { handleErr(res, err); }
};

export const deleteQuestion = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try { 
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        await questionService.deleteQuestion(req.params.id, req.adminId); 
        res.json({ message: 'Question deleted' }); 
    }
    catch (err) { handleErr(res, err); }
};

export const pinQuestion = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try { 
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        res.json(await questionService.pinQuestion(req.params.id, req.adminId)); 
    }
    catch (err) { handleErr(res, err); }
};

export const editQuestion = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try {
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        res.json(await questionService.editQuestion(req.params.id, req.adminId, req.body.content));
    }
    catch (err) { handleErr(res, err); }
};
