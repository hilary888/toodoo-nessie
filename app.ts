import { config as envConfig, Drash } from "./deps.ts";
import { HomeResource } from "./resources/home_resource.ts";

const env = envConfig();

const server = new Drash.Server({
  hostname: env.HOSTNAME,
  port: Number(env.PORT),
  protocol: "http",
  resources: [
    HomeResource,
  ],
});

server.run();
console.log(`Server running at ${server.address}.`);
