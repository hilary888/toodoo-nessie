import { Drash } from "../deps.ts";

export class TodoResource extends Drash.Resource {
    public paths = [
        "/todo",
        "/todo/:id"
    ];

    public POST(
        request: Drash.Request,
        response: Drash.Response
    ): void {
        console.log("Todo Post method");
        return response.text("Todo Post method");
    }
}