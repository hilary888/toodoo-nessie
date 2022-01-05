import { Drash } from "../deps.ts";

export class BaseResource extends Drash.Resource {
    protected validateUsername(username: string | undefined): boolean {
        const invalidValues = [undefined, null, ""];
        const result = !invalidValues.includes(username);
        return result;
    }
    
    protected validateEmail(email: string | undefined): boolean {
        const invalidValues = [undefined, null, ""];
        const mailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!invalidValues.includes(email)) {
            return mailformat.test(email!);
        } else {
            return false;
        }
    }
    
    protected validatePassword(password: string | undefined): boolean {
        const invalidValues = [undefined, null, ""];
        if (!invalidValues.includes(password)) {
            return password!.length >= 8;
        } else {
            return false;
        }
    }
}