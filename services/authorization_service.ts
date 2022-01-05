import { Drash, verify, Payload } from "../deps.ts";
import { key } from "../utils.ts";

export class AuthorizationService extends Drash.Service {
    /**
     * Run this service before the resource's HTTP method
     */
    public async runBeforeResource(
        request: Drash.Request,
        response: Drash.Response
    ): Promise<void> {        
        const bearerToken = request.headers.get("authorization");
        if (bearerToken?.startsWith("Bearer ")) {
            const token = bearerToken.substring(7, bearerToken.length);
            try {
                await verify(token, key);
            } catch (error) {
                throw new Drash.Errors.HttpError(
                    401,
                    `No or invalid JWT. Error: ${error}`
                )
            }
        } else {
            throw new Drash.Errors.HttpError(
                401,
                "No or invalid JWT."
            )

        }
    }

    /**
     * Run this service after the resource's HTTP method
     */
    public runAfterResource(
        request: Drash.Request,
        response: Drash.Response
    ): void {}
}