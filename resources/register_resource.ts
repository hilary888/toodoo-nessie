import { 
    Drash, 
    bcrypt, 
    dexter,
 } from "../deps.ts";
import { client } from "../db.ts";
import { Users } from "../models/users_model.ts";

export class RegisterResource extends Drash.Resource {
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
        const result = await client.queryObject<Users>(`
            INSERT INTO users (username, email, password)
            VALUES ('${username}', '${email}', '${hashedPassword}')
            RETURNING *;
        `);
        await client.end();

        if (result.rows.length > 0) {
            const userDetails = result.rows[0];
            dexter.logger.info(`Account created for ${userDetails.email}`)
            return response.json({
                success: true,
                payload: result.rows
            });
        } else {
            dexter.logger.error(`Account creation for ${email} failed`);
            response.status = 422;
            return response.json({
                errors: {
                    body: {
                        message: "An error occurred while trying to create your account."
                    }
                }
            });
        }

    }
}