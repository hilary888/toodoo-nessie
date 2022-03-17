import { Client, envConfig, Database, PostgresConnector } from './deps.ts';

const env = envConfig();

// export const client = new Client({
//     user: env.DB_USERNAME,
//     database: env.DB_NAME,
//     hostname: env.DB_HOSTNAME,
//     port: env.DB_PORT,
//     password: env.DB_PASSWORD,
//     tls: {
//         enforce: false,
//     }
// });

const connection = new PostgresConnector({
    host: env.DB_HOSTNAME,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    port: Number(env.DB_PORT),
    database: env.DB_NAME,
});

export const db = new Database(connection);
