import { Drash, bcrypt } from "../deps.ts";
import { client } from "../db.ts";


export class RegistrationResource extends Drash.Resource {
    public paths = ["/register"];

    public async POST(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const username: string | undefined = request.bodyParam("username");
        const email: string | undefined = request.bodyParam("email");
        const password: string | undefined = request.bodyParam("password");
    
        if(username === undefined || email === undefined || password === undefined) {
            throw new Drash.Errors.HttpError(
                400,
                "username, email, password need to be provided."
            );
        }

        await client.connect();
        const emailExists = await client.queryObject(`
            SELECT * FROM users
            WHERE email = '${email}';
        `);
        await client.end();

        if (emailExists.rows.length > 0) {
            throw new Drash.Errors.HttpError(
                400,
                "Email already exists."
            );
        }

        const validPassword: string = password!;
        const hashedPassword = await bcrypt.hash(validPassword);
        await client.connect();
        const result = await client.queryObject(`
            INSERT INTO users (username, email, password)
            VALUES ('${username}', '${email}', '${hashedPassword}')
            RETURNING *;
        `);
        await client.end();

        return response.json({
            success: true,
            payload: result.rows
        });

    }
}