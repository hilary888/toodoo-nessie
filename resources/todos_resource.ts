import { Drash, dexter } from "../deps.ts";
import { AuthorizationService } from "../services/authorization_service.ts";
import { getJwtPayload } from "../utils.ts";
import { User } from "../models/user_model.ts";
import { Todo } from "../models/todo_model.ts";

export class TodosResource extends Drash.Resource {
    public paths = [
        "/todo"
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
        // Get all todos created by user
        const payload = await getJwtPayload(request);
        const userId = payload.sub!;

        const result = await Todo.where({userId: userId}).get();
        const userResult = await User.where({id: Number(userId)}).first();

        dexter.logger.info(`All todos requested by ${userResult.email}`)
        return response.json({
            status: "success",
            data: result,
        });
    }
}