import { AbstractMigration, Info, ClientPostgreSQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
    /** Runs on migrate */
    async up(info: Info): Promise<void> {
        await this.client.queryArray(`
            ALTER TABLE todo
                ALTER COLUMN user_id SET NOT NULL;

        `);
    }

    /** Runs on rollback */
    async down(info: Info): Promise<void> {
        await this.client.queryArray(`
            ALTER TABLE todo
                ALTER COLUMN user_id DROP NOT NULL;
        `);
    }
}
