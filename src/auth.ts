import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { stringify } from "node:querystring";
import { isStringObject } from "node:util/types";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
    const result = await argon2.hash(password);
    return result;
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    const result = await argon2.verify(hash, password);
    return result;
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const iat = Math.floor(Date.now() / 1000);
    const jwtPayload: payload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: expiresIn + iat
    };
    return jwt.sign(jwtPayload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
    try {
        const output = jwt.verify(tokenString, secret);
        if (isStringObject(output)) {
            throw new Error("Token validation failed");
        }
        else {
            return output.sub as string;
        }
    } catch (err) {
        throw err;
    }
}