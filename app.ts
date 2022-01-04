import { envConfig, Drash, dexter } from "./deps.ts";
import { HomeResource } from "./resources/home_resource.ts";
import { TodoResource } from "./resources/todo_resource.ts";
import { RegisterResource } from "./resources/register_resource.ts";
import { LoginResource } from "./resources/login_resource.ts";
import { client } from "./db.ts";

const env = envConfig();
// const dexter = new DexterService({
//   enabled: true,
//   url: true,
//   method: true,
// });

const server = new Drash.Server({
  hostname: env.HOSTNAME,
  port: Number(env.PORT),
  protocol: "http",
  resources: [
    HomeResource,
    TodoResource,
    RegisterResource,
    LoginResource,
  ],
  services: [
    dexter,
  ]
});


server.run();
console.log(`Server running at ${server.address}.`);
