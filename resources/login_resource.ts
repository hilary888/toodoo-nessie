import { Drash, bcrypt, create, getNumericDate, dexter } from "../deps.ts";
import { key } from "../utils.ts";
import { User } from "../models/user_model.ts";
export class LoginResource extends Drash.Resource {
    public paths = ["/login"];

    public async POST(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        const emailOrUndefined: string | undefined = request.bodyParam("email");
        const plaintextPasswordOrUndefined: string | undefined = request.bodyParam("password");
        let email: string;
        let plaintextPassword: string;

        // Check provided email and password 
        if (emailOrUndefined === undefined || plaintextPasswordOrUndefined === undefined) {
            const validationResult = {};

            if (emailOrUndefined === undefined) {
                Object.assign(validationResult, {email: "Provide an email address"});
            }

            if (plaintextPasswordOrUndefined === undefined) {
                Object.assign(validationResult, {password: "Provide a password"});
            }


            response.status = 422   // Unprocessable entity
            return response.json({
                status: "fail",
                data: validationResult
            });
        } else {
            email = emailOrUndefined!;
            plaintextPassword = plaintextPasswordOrUndefined!;
        }

        const userDetails: User = await User.where({email: email}).first();

        if (userDetails !== null) {
            const hashedPassword: string = userDetails.password?.toString()!;
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