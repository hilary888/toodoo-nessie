import { AbstractMigration, Info, ClientPostgreSQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
    /** Runs on migrate */
    async up(info: Info): Promise<void> {
        await this.client.queryArray(`
            ALTER TABLE todo
                ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
                ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
            ;
        `);
    }

    /** Runs on rollback */
    async down(info: Info): Promise<void> {
        await this.client.queryArray(`
        ALTER TABLE todo
            ALTER COLUMN created_at DROP DEFAULT,
            ALTER COLUMN updated_at DROP DEFAULT
        ;
        `);
    }
}
