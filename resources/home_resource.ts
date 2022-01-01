import { Drash } from "../deps.ts";

export class HomeResource extends Drash.Resource {
    public paths = ["/"];

    public GET(
        request: Drash.Request,
        response: Drash.Response
    ): void {
        response.text("Hello to toodoo-nessie");
    }
}