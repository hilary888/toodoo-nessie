import { 
    Drash, 
    bcrypt, 
    dexter,
 } from "../deps.ts";
import { client, db } from "../db.ts";
import { Users } from "../models/users_model.ts";
import { BaseResource } from "./base_resource.ts";

export class RegisterResource extends BaseResource {
    public paths = ["/register"];

    public async POST(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {
        // Get values from request
        const usernameOrUndefined: string | undefined = request.bodyParam("username");
        const emailOrUndefined: string | undefined = request.bodyParam("email");
        const passwordOrUndefined: string | undefined = request.bodyParam("password");
        let username: string;
        let email: string;
        let password: string;

        // Check if values provided are valid
        if(!this.validateUsername(usernameOrUndefined) || !this.validateEmail(emailOrUndefined) || !this.validatePassword(passwordOrUndefined)) {
            // Append message to validationResult for every invalid value
            let validationResult = {};
            
            if(!this.validateUsername(usernameOrUndefined)) {
                Object.assign(validationResult, {username: `A username must be provided`});
            }

            if (!this.validateEmail(emailOrUndefined)) {
                Object.assign(validationResult, {email: `An email must be provided`});
            }

            if (!this.validatePassword(passwordOrUndefined)) {
                Object.assign(validationResult, {password: `A password of at least length 8 must be provided`});
            }

            response.status = 422;  // Unprocessable entity
            return response.json({
                status: "fail",
                data: validationResult
            });
        } else {
            username = usernameOrUndefined!;
            email = emailOrUndefined!;
            password = passwordOrUndefined!;
        }

        // Check if email already exists in users table
        const emailExists = await Users.where({email: email}).count() > 0;

        if (emailExists) {
            response.status = 409   // Conflict
            return response.json({
                status: "error",
                message: "Provided email already exists"
            });
        }

        // Create user account
        const validPassword: string = password!;
        const hashedPassword = await bcrypt.hash(validPassword);
        
        const result = await Users.create({
            username: username,
            email: email,
            password: hashedPassword,
        });

        if (result !== null) {
            const userDetails = result;
            dexter.logger.info(`Account created for ${userDetails.email}`)
            return response.json({
                status: "success",
                data: result,
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