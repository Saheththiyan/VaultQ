import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Event } from './Event';

export enum QuestionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Index(['event_id', 'status'])
@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Index()
    @Column({ type: 'uuid' }) event_id!: string;
    @ManyToOne(() => Event, (e) => e.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' }) event!: Event;
    @Column({ type: 'text' }) content!: string;
    @Index()
    @Column({ type: 'enum', enum: QuestionStatus, default: QuestionStatus.PENDING }) status!: QuestionStatus;
    @Column({ type: 'boolean', default: false }) is_visible!: boolean;
    @CreateDateColumn() created_at!: Date;
}
