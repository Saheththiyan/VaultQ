import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminToEvent1772382253584 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add admin_id column as nullable first
        await queryRunner.query(`
            ALTER TABLE events 
            ADD COLUMN admin_id uuid
        `);
        
        // Check if any admin exists
        const admins = await queryRunner.query(`SELECT id FROM admins LIMIT 1`);
        
        if (admins.length > 0) {
            const defaultAdminId = admins[0].id;
            
            // Assign first admin to all existing events
            await queryRunner.query(`
                UPDATE events 
                SET admin_id = '${defaultAdminId}'
                WHERE admin_id IS NULL
            `);
            
            console.log(`✅ Assigned admin ${defaultAdminId} to all existing events`);
            
            // Now make it NOT NULL
            await queryRunner.query(`
                ALTER TABLE events 
                ALTER COLUMN admin_id SET NOT NULL
            `);
        } else {
            console.log('⚠️  No admin found. Column admin_id will remain nullable.');
            console.log('⚠️  Run "npm run seed:admin" and then manually set NOT NULL constraint.');
        }
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE events 
            ADD CONSTRAINT fk_events_admin 
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        `);
        
        // Add index for performance
        await queryRunner.query(`
            CREATE INDEX idx_events_admin_id ON events(admin_id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_events_admin_id
        `);
        
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
