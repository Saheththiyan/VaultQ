import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminToEvent1772382253584 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get the first admin ID to use as default
        const admins = await queryRunner.query(`SELECT id FROM admins LIMIT 1`);
        if (admins.length === 0) {
            throw new Error('No admin found in database. Please create an admin first.');
        }
        const defaultAdminId = admins[0].id;
        
        // Add admin_id column with the default admin
        await queryRunner.query(`
            ALTER TABLE events 
            ADD COLUMN admin_id uuid NOT NULL DEFAULT '${defaultAdminId}'
        `);
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE events 
            ADD CONSTRAINT fk_events_admin 
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        `);
        
        // Remove default after applying it to existing rows
        await queryRunner.query(`
            ALTER TABLE events 
            ALTER COLUMN admin_id DROP DEFAULT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE events 
            DROP CONSTRAINT IF EXISTS fk_events_admin
        `);
        
        // Drop admin_id column
        await queryRunner.query(`
            ALTER TABLE events 
            DROP COLUMN IF EXISTS admin_id
        `);
    }

}
