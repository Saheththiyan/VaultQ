import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany } from 'typeorm';
import { Question } from './Question';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column({ type: 'varchar' }) title!: string;
    @Index({ unique: true })
    @Column({ type: 'varchar', unique: true }) event_code!: string;
    @Column({ type: 'boolean', default: true }) is_active!: boolean;
    @CreateDateColumn() created_at!: Date;
    @OneToMany(() => Question, (q) => q.event) questions!: Question[];
}
