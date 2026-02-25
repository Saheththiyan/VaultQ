import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1708900000000 implements MigrationInterface {
    name = 'InitialMigration1708900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`
      CREATE TYPE "public"."questions_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')
    `);

        await queryRunner.query(`
      CREATE TABLE "admins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_admins_email" UNIQUE ("email"),
        CONSTRAINT "PK_admins" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "event_code" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_events_event_code" UNIQUE ("event_code"),
        CONSTRAINT "PK_events" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_events_event_code" ON "events" ("event_code")`);

        await queryRunner.query(`
      CREATE TABLE "questions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_id" uuid NOT NULL,
        "content" text NOT NULL,
        "status" "public"."questions_status_enum" NOT NULL DEFAULT 'PENDING',
        "is_visible" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_questions" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_questions_event_id" ON "questions" ("event_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_questions_status" ON "questions" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_questions_event_status" ON "questions" ("event_id", "status")`);
        await queryRunner.query(`
      ALTER TABLE "questions"
        ADD CONSTRAINT "FK_questions_event_id"
        FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_questions_event_id"`);
        await queryRunner.query(`DROP INDEX "IDX_questions_event_status"`);
        await queryRunner.query(`DROP INDEX "IDX_questions_status"`);
        await queryRunner.query(`DROP INDEX "IDX_questions_event_id"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP INDEX "IDX_events_event_code"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TYPE "public"."questions_status_enum"`);
    }
}
