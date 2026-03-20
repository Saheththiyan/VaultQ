import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPinnedToQuestion1772382253586 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "is_pinned" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "questions" DROP COLUMN IF EXISTS "is_pinned"
        `);
    }
}
