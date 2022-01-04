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
            throw new Drash.Errors.HttpError(
                400,
                "Email and password must be provided."
            );
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
                    success: true,
                    token: jwt,
                });
            } else {
                response.status = 401;
                return response.json({
                    errors: {
                        body: {
                            message: "Invalid username or password."
                        }
                    }
                });
            }
        } else {
            return response.json({
                success: false,
                error: "No user found for the provided credentials."
            });
        }
    }
}