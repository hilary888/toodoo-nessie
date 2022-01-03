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