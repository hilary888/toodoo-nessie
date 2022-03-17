import { envConfig, Drash, dexter, Relationships } from "./deps.ts";
import { HomeResource } from "./resources/home_resource.ts";
import { TodoResource } from "./resources/todo_resource.ts";
import { RegisterResource } from "./resources/register_resource.ts";
import { LoginResource } from "./resources/login_resource.ts";
import { TodosResource } from "./resources/todos_resource.ts";
import { db } from "./db.ts";
import { User } from "./models/user_model.ts";
import { Todo } from "./models/todo_model.ts";

const env = envConfig();

const server = new Drash.Server({
  hostname: env.HOSTNAME,
  port: Number(env.PORT),
  protocol: "http",
  resources: [
    HomeResource,
    TodoResource,
    TodosResource,
    RegisterResource,
    LoginResource,
  ],
  services: [
    dexter,
  ]
});

// denodb link models to db tables
Relationships.belongsTo(Todo, User);
db.link([
  User,
  Todo,
]);


server.run();
console.log(`Server running at ${server.address}.`);
