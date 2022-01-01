import { Dorm, config as envConfig } from "./deps.ts";

const env = envConfig();
const dbUrl = env.dorm_databaseURL;
export const dorm = new Dorm(dbUrl);