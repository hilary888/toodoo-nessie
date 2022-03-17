import { envConfig, Drash, dexter } from "./deps.ts";
// import { HomeResource } from "./resources/home_resource.ts";
// import { TodoResource } from "./resources/todo_resource.ts";
import { RegisterResource } from "./resources/register_resource.ts";
import { LoginResource } from "./resources/login_resource.ts";
import { db } from "./db.ts";
import { Users } from "./models/users_model.ts";

const env = envConfig();

const server = new Drash.Server({
  hostname: env.HOSTNAME,
  port: Number(env.PORT),
  protocol: "http",
  resources: [
    // HomeResource,
    // TodoResource,
    RegisterResource,
    LoginResource,
  ],
  services: [
    dexter,
  ]
});

// denodb link models to db tables
db.link([
  Users,
]);


server.run();
console.log(`Server running at ${server.address}.`);
