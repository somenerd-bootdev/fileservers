import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
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
    const output = jwt.verify(tokenString, secret);
    if (typeof output == "string") {
        throw new Error("Token validation failed");
    }
    else {
        return output.sub as string;
    }
}

export function getBearerToken(req: Request): string {
    const authHeader = req.get("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new Error("Invalid Authorization header");
    }
    return authHeader.replace("Bearer ", "");
}