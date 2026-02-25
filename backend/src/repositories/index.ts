import { AppDataSource } from '../config/database';
import { Admin } from '../entities/Admin';
import { Event } from '../entities/Event';
import { Question } from '../entities/Question';

export const AdminRepository = AppDataSource.getRepository(Admin);
export const EventRepository = AppDataSource.getRepository(Event);
export const QuestionRepository = AppDataSource.getRepository(Question);
