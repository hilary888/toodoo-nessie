import { Drash, bcrypt, create, getNumericDate, dexter } from "../deps.ts";
import { client } from "../db.ts";
import { key } from "../utils.ts";
import { Users } from "../models/users_model.ts";
export class LoginResource extends Drash.Resource {
    public paths = ["/login"];

    public async POST(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const email = request.bodyParam("email");
        const plaintextPassword: string | undefined = request.bodyParam("password");

        if (email === undefined || plaintextPassword === undefined) {
            const validationResult = {};

            if (email === undefined) {
                Object.assign(validationResult, {email: "Provide an email address"});
            }

            if (plaintextPassword === undefined) {
                Object.assign(validationResult, {password: "Provide a password"});
            }


            response.status = 422   // Unprocessable entity
            return response.json({
                status: "fail",
                data: validationResult
            });
        }

        await client.connect();
        const result = await client.queryObject<Users>(`
            SELECT * FROM users
            WHERE email = '${email}'
            LIMIT 1;
        `);
        await client.end();

        if (result.rows.length > 0) {
            const userDetails = result.rows[0];
            const hashedPassword = userDetails.password;
            const isValidPassword = await bcrypt.compare(plaintextPassword, hashedPassword);

            if (isValidPassword) {
                const jwt = await create({ 
                    alg: "HS512", 
                    typ: "JWT" }, 
                    {sub: `${userDetails.id}`, exp: getNumericDate(60 * 60)}, 
                    key);
                dexter.logger.info(`Account ${userDetails.email} logged in.`);
                return response.json({
                    status: "success",
                    data: {
                        token: jwt
                    }
                });
            } else {
                response.status = 422;  // Unprocessable entity
                return response.json({
                    status: "error",
                    message: "Invalid username or password"
                });
            }
        } else {
            response.status = 422;  // Unauthorized
            return response.json({
                status: "error",
                message: "No user found for the provided credentials."
            });
        }
    }
}