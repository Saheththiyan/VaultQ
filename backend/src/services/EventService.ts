import { EventRepository } from '../repositories/index';
import { Event } from '../entities/Event';

function generateCode(len = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export class EventService {
    async createEvent(title: string): Promise<Event> {
        let code: string;
        do { code = generateCode(); } while (await EventRepository.findOne({ where: { event_code: code } }));
        return EventRepository.save(EventRepository.create({ title, event_code: code }));
    }

    async getAllEvents(): Promise<Event[]> {
        return EventRepository.find({ order: { created_at: 'DESC' } });
    }

    async getEventById(id: string): Promise<Event | null> {
        return EventRepository.findOne({ where: { id } });
    }

    async getEventByCode(eventCode: string): Promise<Event | null> {
        return EventRepository.findOne({ where: { event_code: eventCode } });
    }

    async deleteEvent(id: string): Promise<void> {
        await EventRepository.delete(id);
    }
}

export const eventService = new EventService();
