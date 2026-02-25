import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('admins')
export class Admin {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column({ type: 'varchar', unique: true }) email!: string;
    @Column({ type: 'varchar' }) password_hash!: string;
    @CreateDateColumn() created_at!: Date;
}
