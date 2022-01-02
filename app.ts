import { envConfig, Drash } from "./deps.ts";
import { HomeResource } from "./resources/home_resource.ts";
import { TodoResource } from "./resources/todo_resource.ts";
import { RegistrationResource } from "./resources/registration_resource.ts";
import { client } from "./db.ts";

const env = envConfig();

const server = new Drash.Server({
  hostname: env.HOSTNAME,
  port: Number(env.PORT),
  protocol: "http",
  resources: [
    HomeResource,
    TodoResource,
    RegistrationResource,
  ],
});


server.run();
console.log(`Server running at ${server.address}.`);
