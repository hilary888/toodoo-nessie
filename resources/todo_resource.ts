import { Drash } from "../deps.ts";
import { client } from "../db.ts";
import { AuthorizationService } from "../services/authorization_service.ts";
import { getJwtPayload } from "../utils.ts";

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
        const result = await client.queryObject(`
            INSERT INTO todo (title, body, user_id)
            VALUES ('${title}', '${body}', ${userId})
            RETURNING *;
        `);
        await client.end();

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

        if(pathId !== undefined && !isNaN(id)) {
            await client.connect();
            const result = await client.queryObject(`
                SELECT * FROM todo WHERE id = ${id} AND user_id = ${userId};
            `);
            await client.end();
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
            const result = await client.queryObject(`
                UPDATE todo
                SET title = '${title}',
                    body = '${body}',
                    updated_at = current_timestamp
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *;
            `);
            await client.end();
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
            const result = await client.queryObject(`
                DELETE FROM todo
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *;
            `);
            await client.end();

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