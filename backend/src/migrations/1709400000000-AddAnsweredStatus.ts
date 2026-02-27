import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnsweredStatus1709400000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add ANSWERED to the status enum
        await queryRunner.query(`
            ALTER TYPE "questions_status_enum" ADD VALUE IF NOT EXISTS 'ANSWERED'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing enum values directly
        // You would need to recreate the enum type if rollback is needed
        console.log('Rollback not fully supported for enum value addition');
    }
}
