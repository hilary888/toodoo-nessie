import { Drash } from "../deps.ts";
import { client } from "../db.ts";
import { AuthorizationService } from "../services/authorization_service.ts";

export class TodoResource extends Drash.Resource {
    public paths = [
        "/todo",
        "/todo/:id"
    ];

    public services = {
        ALL: [
            new AuthorizationService(),
        ]
    }

    
    public async POST(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const title = request.bodyParam("title");
        const body = request.bodyParam("body");

        console.log("title", title);
        console.log("body", body);

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
            INSERT INTO todo (title, body, created_at, updated_at)
            VALUES ('${title}', '${body}', current_timestamp, current_timestamp)
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

        if(pathId !== undefined && !isNaN(id)) {
            await client.connect();
            const result = await client.queryObject(`
                SELECT * FROM todo WHERE id = ${id};
            `);
            await client.end();
            return response.json({
                success: true,
                payload: result.rows,
            });
        } else if (pathId === undefined) {
            await client.connect();
            const result = await client.queryObject(`
                SELECT * FROM todo;
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

        if(pathId !== undefined && !isNaN(id)) {
            await client.connect();
            const result = await client.queryObject(`
                UPDATE todo
                SET title = '${title}',
                    body = '${body}',
                    updated_at = current_timestamp
                WHERE id = ${id}
                RETURNING *;
            `);
            await client.end();
            return response.json({
                success: true,
                payload: result.rows,
            });
        }

        throw new Drash.Errors.HttpError(
            400,
            "Error processing request"
        );
    }

    public async DELETE(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const pathId = request.pathParam("id");
        const id = Number(pathId);

        if(pathId !== undefined && !isNaN(id)) {
            await client.connect();
            const result = await client.queryObject(`
                DELETE FROM todo
                WHERE id = ${id}
                RETURNING *;
            `);
            await client.end();

            return response.json({
                success: true,
                payload: result.rows
            });
        }

        throw new Drash.Errors.HttpError(
            400,
            "Error processing request"
        )
    }
}