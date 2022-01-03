import { 
    Drash, 
    bcrypt, 
    create,
    getNumericDate,
 } from "../deps.ts";
import { client } from "../db.ts";
import { key } from "../utils.ts";


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

        // Check if email already exists in users table
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

        // Create user account
        const validPassword: string = password!;
        const hashedPassword = await bcrypt.hash(validPassword);
        await client.connect();
        const result = await client.queryObject(`
            INSERT INTO users (username, email, password)
            VALUES ('${username}', '${email}', '${hashedPassword}')
            RETURNING *;
        `);
        await client.end();

        // Generate jwt token
        const jwt = await create({ alg: "HS512", typ: "JWT" }, {exp: getNumericDate(3 * 60 * 60)}, key)

        return response.json({
            success: true,
            token: jwt,
            payload: result.rows
        });

    }
}