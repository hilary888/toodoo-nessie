# Toodoo
## Summary
A Todo API written with the Drash HTTP framework, Nessie db migration library,
and denodb as an ORM. This project previously used postgres client library for
database interactions.

The essence of this project was to explore CRUD operations in deno. 

## Endpoints
| HTTP method | URI path    | Description                                     |
| ----------- | ----------- | ----------------------------------------------- |
| POST        | /todo       | Create a todo list                              |
| GET         | /todo       | Get all todo lists of a logged in user          |
| GET         | /todo/:id   | Get a specific todo list belonging to a user    |
| PUT         | /todo/:id   | Update existing todo list                       |
| DELETE      | /todo/:id   | Delete todo list                                |


## How to run
* Change into base directory of this project
* `deno run --unstable --allow-read --allow-write --allow-net --allow-env app.ts `