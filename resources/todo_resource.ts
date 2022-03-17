import { Drash, dexter } from "../deps.ts";
import { AuthorizationService } from "../services/authorization_service.ts";
import { getJwtPayload } from "../utils.ts";
import { User } from "../models/user_model.ts";
import { Todo } from "../models/todo_model.ts";

export class TodoResource extends Drash.Resource {
    public paths = [
        "/todo",
        "/todo/:id"
    ];

    authorisationService = new AuthorizationService();
    public services = {
        ALL: [
            this.authorisationService,
        ]
    }

    
    public async POST(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const titleOrUndefined: string | undefined = request.bodyParam("title");
        const bodyOrUndefined: string | undefined = request.bodyParam("body");
        const payload = await getJwtPayload(request);
        const userIdOrUndefined: string | undefined = payload.sub;
        let title: string;
        let body: string;
        let userId: number;


        if (titleOrUndefined === undefined || bodyOrUndefined === undefined || userIdOrUndefined === undefined) {
            const validationResult = {};

            if (titleOrUndefined === undefined) {
                Object.assign(validationResult, {title: "Provide title for todo list"});
            }

            if (bodyOrUndefined === undefined) {
                Object.assign(validationResult, {body: "Provide body for todo list"});
            }

            if (userIdOrUndefined === undefined) {
                Object.assign(validationResult, {body: "User id not provided in token"});
            }

            response.status = 422
            return response.json({
                status: "fail",
                data: validationResult
            });
        } else {
            title = titleOrUndefined!;
            body = bodyOrUndefined!;
            userId = Number(userIdOrUndefined);
        }

        const result = await Todo.create({
            title: title,
            body: body,
            userId: userId,
        });
        const userResult = await Todo.where({id: result.id?.toString()!}).user();
        

        dexter.logger.info(`New todo created by ${userResult.email}. id = ${result.id}`);
        return response.json({
            status: "success",
            data: result,
        });

    }

    public async GET(
        request: Drash.Request,
        response: Drash.Response,
    ): Promise<void> {
        const pathId = request.pathParam("id");
        const id = Number(pathId);
        const payload = await getJwtPayload(request);
        const userId = payload.sub!;

        if(pathId !== undefined && !isNaN(id)) {
            // Get a specific todo created by user
            const result = await Todo.where({
                id: id,
                userId: userId, 
            }).first();
            console.log(result);

            if (result !== null) {
                const userResult = await Todo.where({id: Number(result.id)}).user();
                console.log("userResult: ", userResult);
                dexter.logger.info(`Todo id = ${result.id} requested by ${userResult.email}`);
                return response.json({
                    status: "success",
                    data: result,
                });
            } else {
                response.status = 400   // Bad Request
                return response.json({
                    status: "error",
                    message: "Invalid todo id"
                });
            }
            
        } else if (pathId === undefined) {
            // Get all todos created by user
            const result = await Todo.where({userId: userId}).get();
            const userResult = await User.where({id: Number(userId)}).first();

            dexter.logger.info(`All todos requested by ${userResult.email}`)
            return response.json({
                status: "success",
                data: result,
            });
        }        
    }

    public async PUT(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const pathId = request.pathParam("id");
        const id = Number(pathId);
        const title: string = request.bodyParam("title")!;
        const body: string = request.bodyParam("body")!;
        const userId = await getJwtPayload(request).then(value => value.sub);

        if(pathId !== undefined && !isNaN(id)) {
            // Update todo
            await Todo.where({id: id, userId: userId!}).update({
                title: title,
                body: body,
            });
            const todo: Todo = await Todo.find(id);

            if (todo !== null) {
                const user = await User.where({id: userId!}).first();

                dexter.logger.info(`Todo id: ${todo.id} edited by ${user.email}`);
                return response.json({
                    status: "success",
                    data: todo,
                });
            } else {
                response.status = 400;
                return response.json({
                    status: "error",
                    message: "No todo list by this id was found."
                });
            }
        } else {
            response.status = 400;
            return response.json({
                status: "error",
                message: "Error processing request. Provide a todo id number"
            });
        }

        
    }

    public async DELETE(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const pathId = request.pathParam("id");
        const id = Number(pathId);
        const userId = await getJwtPayload(request).then(value => value.sub);

        if(pathId !== undefined && !isNaN(id)) {
            
            const todo = await Todo.deleteById(id);
            console.log("deleted: ", todo);

            if (todo !== null) {
                
                const user = await User.find(userId!);
                
                dexter.logger.info(`Todo id ${id} deleted by ${user.email}`);
                return response.json({
                    status: "success",
                });
            } else {
                response.status = 400;
                return response.json({
                    status: "error",
                    message: "No todo list by this id was found"
                })
            }
            
        } else {
            response.status = 400;
            return response.json({
                status: "error",
                message: "Error processing request. Provide a todo id number"
            });
        }
    }
}