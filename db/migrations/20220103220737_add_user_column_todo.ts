import { AbstractMigration, Info, ClientPostgreSQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
    /** Runs on migrate */
    async up(info: Info): Promise<void> {
        await this.client.queryArray(`
            ALTER TABLE todo
            ADD COLUMN user_id INTEGER,
            ADD CONSTRAINT user_id
                FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
            ;
        `);
    }

    /** Runs on rollback */
    async down(info: Info): Promise<void> {
        await this.client.queryArray(`
            ALTER TABLE todo
            DROP COLUMN user_id
            ;
        `);
    }
}
