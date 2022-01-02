import { Client, envConfig } from "./deps.ts";

const env = envConfig();

export const client = new Client({
    user: env.DB_USERNAME,
    database: env.DB_NAME,
    hostname: env.DB_HOSTNAME,
    port: env.DB_PORT,
    password: env.DB_PASSWORD,
});

