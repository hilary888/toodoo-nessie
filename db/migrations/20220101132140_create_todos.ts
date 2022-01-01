import { AbstractMigration, ClientPostgreSQL, Info } from "../../deps.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(`
            CREATE TABLE todo (
                id SERIAL PRIMARY KEY,
                title VARCHAR NOT NULL,
                body TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL
            );
        `);
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
    await this.client.queryArray(`
            DROP TABLE todo;
        `);
  }
}
