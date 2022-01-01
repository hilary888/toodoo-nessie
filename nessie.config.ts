import { ClientPostgreSQL, config as envConfig, NessieConfig } from "./deps.ts";

const env = envConfig();

const client = new ClientPostgreSQL({
  database: env.DB_NAME,
  hostname: env.DB_HOSTNAME,
  port: env.DB_PORT,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
});

/** This is the final config object */
const config: NessieConfig = {
  client,
  migrationFolders: ["./db/migrations"],
  seedFolders: ["./db/seeds"],
};

export default config;
