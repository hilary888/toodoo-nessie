import { 
    Drash, 
    bcrypt, 
    dexter,
 } from "../deps.ts";
import { client } from "../db.ts";
import { Users } from "../models/users_model.ts";
import { BaseResource } from "./base_resource.ts";

export class RegisterResource extends BaseResource {
    public paths = ["/register"];

    public async POST(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        // Get json values from request
        const username: string | undefined = request.bodyParam("username");
        const email: string | undefined = request.bodyParam("email");
        const password: string | undefined = request.bodyParam("password");

        // Check if values provided are valid
        if(!this.validateUsername(username) || !this.validateEmail(email) || !this.validatePassword(password)) {
            // Append message to validationResult for every invalid value
            let validationResult = {};
            
            if(!this.validateUsername(username)) {
                Object.assign(validationResult, {username: `A username must be provided`});
            }

            if (!this.validateEmail(email)) {
                Object.assign(validationResult, {email: `An email must be provided`});
            }

            if (!this.validatePassword(password)) {
                Object.assign(validationResult, {password: `A password of at least length 8 must be provided`});
            }

            response.status = 422;  // Unprocessable entity
            return response.json({
                status: "fail",
                data: validationResult
            });
        }

        // Check if email already exists in users table
        await client.connect();
        const emailExists = await client.queryObject(`
            SELECT * FROM users
            WHERE email = '${email}';
        `);
        await client.end();

        if (emailExists.rows.length > 0) {
            response.status = 409   // Conflict
            return response.json({
                status: "error",
                message: "Provided email already exists"
            });
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
                status: "success",
                data: result.rows
            });
        } else {
            dexter.logger.error(`Account creation for ${email} failed`);
            response.status = 422;  // Unprocessable entity
            return response.json({
                status: "error",
                message: "Application is unable to create account"
            });
        }

    }
}