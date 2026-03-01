import { Request, Response } from 'express';
import { eventService } from '../services/EventService';

export const getEvents = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try { 
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        res.json(await eventService.getAllEvents(req.adminId)); 
    }
    catch { res.status(500).json({ error: 'Internal server error' }); }
};

export const createEvent = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try { 
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        res.status(201).json(await eventService.createEvent(req.body.title, req.adminId)); 
    }
    catch { res.status(500).json({ error: 'Internal server error' }); }
};

export const deleteEvent = async (req: Request & { adminId?: string }, res: Response): Promise<void> => {
    try {
        if (!req.adminId) { res.status(401).json({ error: 'Unauthorized' }); return; }
        const event = await eventService.getEventById(req.params.id, req.adminId);
        if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
        await eventService.deleteEvent(req.params.id, req.adminId);
        res.json({ message: 'Event deleted' });
    } catch { res.status(500).json({ error: 'Internal server error' }); }
};

export const getEventByCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const event = await eventService.getEventByCode(req.params.eventCode);
        if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
        res.json(event);
    } catch { res.status(500).json({ error: 'Internal server error' }); }
};
