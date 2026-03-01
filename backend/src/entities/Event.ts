import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './Question';
import { Admin } from './Admin';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column({ type: 'varchar' }) title!: string;
    @Index({ unique: true })
    @Column({ type: 'varchar', unique: true }) event_code!: string;
    @Column({ type: 'boolean', default: true }) is_active!: boolean;
    @Column({ type: 'uuid' }) admin_id!: string;
    @CreateDateColumn() created_at!: Date;
    @OneToMany(() => Question, (q) => q.event) questions!: Question[];
    @ManyToOne(() => Admin)
    @JoinColumn({ name: 'admin_id' })
    admin!: Admin;
}
