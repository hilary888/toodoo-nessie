import { Drash, dexter } from "../deps.ts";
import { client } from "../db.ts";
import { AuthorizationService } from "../services/authorization_service.ts";
import { getJwtPayload } from "../utils.ts";
import { Users } from "../models/users_model.ts";
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
        const title = request.bodyParam("title");
        const body = request.bodyParam("body");
        const payload = await getJwtPayload(request);
        const userId = payload.sub;


        if (title === undefined || body === undefined) {
            response.status = 422
            return response.json({
                errors: {
                    body: {
                        message: "Todo title and body content should be provided",
                    }
                }     
            });
        }

        await client.connect();
        const result = await client.queryObject<Todo>(`
            INSERT INTO todo (title, body, user_id)
            VALUES ('${title}', '${body}', ${userId})
            RETURNING *;
        `);

        const userResult = await client.queryObject<Users>(`
            SELECT * FROM users WHERE id = ${userId};
        `);
        await client.end();

        

        dexter.logger.info(`New todo created by ${userResult.rows[0].email}. id = ${result.rows[0].id}`);
        return response.json({
            success: true,
            payload: result.rows,
        });

    }

    public async GET(
        request: Drash.Request,
        response: Drash.Response,
    ): Promise<void> {
        const pathId = request.pathParam("id");
        const id = Number(pathId);
        const payload = await getJwtPayload(request);
        const userId = payload.sub;
        await client.connect();
        const userResult = await client.queryObject<Users>(`
            SELECT * FROM users WHERE id = ${userId};
        `);
        await client.end();

        if(pathId !== undefined && !isNaN(id)) {
            await client.connect();
            const result = await client.queryObject<Todo>(`
                SELECT * FROM todo WHERE id = ${id} AND user_id = ${userId};
            `);
            await client.end();

            dexter.logger.info(`Todo id = ${result.rows[0].id} requested by ${userResult.rows[0].email}`);
            return response.json({
                success: true,
                payload: result.rows,
            });
        } else if (pathId === undefined) {
            await client.connect();
            const result = await client.queryObject(`
                SELECT * FROM todo WHERE user_id = ${userId};
            `);
            await client.end();

            dexter.logger.info(`All todos requested by ${userResult.rows[0].email}`)
            return response.json({
                success: true,
                payload: result.rows,
            });
        }

        throw new Drash.Errors.HttpError(
            400,
            "Resource requires id to be a number"
        );
    }

    public async PUT(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const pathId = request.pathParam("id");
        const id = Number(pathId);
        const title = request.bodyParam("title");
        const body = request.bodyParam("body");
        const userId = await getJwtPayload(request).then(value => value.sub);

        if(pathId !== undefined && !isNaN(id)) {
            await client.connect();
            const result = await client.queryObject<Todo>(`
                UPDATE todo
                SET title = '${title}',
                    body = '${body}',
                    updated_at = current_timestamp
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *;
            `);

            const userResult = await client.queryObject<Users>(`
                SELECT * FROM users WHERE id = ${userId};
            `);
            await client.end();

            dexter.logger.info(`Todo id: ${result.rows[0].id} edited by ${userResult.rows[0].email}`);
            return response.json({
                success: true,
                payload: result.rows,
            });
        }

        response.status = 422;
        return response.json({
            errors: {
                body: {
                    message: "Error processing request."
                }
            }
        });
    }

    public async DELETE(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const pathId = request.pathParam("id");
        const id = Number(pathId);
        const userId = await getJwtPayload(request).then(value => value.sub);

        if(pathId !== undefined && !isNaN(id)) {
            await client.connect();
            const result = await client.queryObject<Todo>(`
                DELETE FROM todo
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *;
            `);
            const userResult = await client.queryObject<Users>(`
                SELECT * FROM users WHERE id = ${userId};
            `);
            await client.end();
            
            dexter.logger.info(`Todo id ${result.rows[0].id} deleted by ${userResult.rows[0].email}`);
            return response.json({
                success: true,
                payload: result.rows
            });
        }

        response.status = 422;
        return response.json({
            errors: {
                body: {
                    message: "Error processing request."
                }
            }
        });
    }
}