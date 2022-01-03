import { AbstractMigration, Info, ClientPostgreSQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
    /** Runs on migrate */
    async up(info: Info): Promise<void> {
        await this.client.queryArray(`
            ALTER TABLE users
            ADD CONSTRAINT email_unique UNIQUE(email)
            ;
        `);
    }

    /** Runs on rollback */
    async down(info: Info): Promise<void> {
        await this.client.queryArray(`
            ALTER TABLE users
            DROP CONSTRAINT email_unique
            ;
        `);
    }
}
