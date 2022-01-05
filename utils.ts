import {Drash, Payload, verify} from "./deps.ts";


export const key = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
);

export async function getJwtPayload(request: Drash.Request): Promise<Payload> {
    const bearerToken = request.headers.get("authorization")!;
    const token = bearerToken.substring(7, bearerToken.length);
    const payload = await verify(token, key);
    return payload;
}

export function validateUsername(username: string | undefined): boolean {
    const invalidValues = [undefined, null, ""];
    const result = !invalidValues.includes(username);
    return result;
}

export function validateEmail(email: string | undefined): boolean {
    const invalidValues = [undefined, null, ""];
    const mailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!invalidValues.includes(email)) {
        return mailformat.test(email!);
    } else {
        return false;
    }
}

export function validatePassword(password: string | undefined): boolean {
    const invalidValues = [undefined, null, ""];
    if (!invalidValues.includes(password)) {
        return password!.length >= 8;
    } else {
        return false;
    }
}