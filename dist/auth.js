import argon2 from "argon2";
import jwt from "jsonwebtoken";
export async function hashPassword(password) {
    const result = await argon2.hash(password);
    return result;
}
export async function checkPasswordHash(password, hash) {
    const result = await argon2.verify(hash, password);
    return result;
}
export function makeJWT(userID, expiresIn, secret) {
    const iat = Math.floor(Date.now() / 1000);
    const jwtPayload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: expiresIn + iat
    };
    return jwt.sign(jwtPayload, secret);
}
export function validateJWT(tokenString, secret) {
    const output = jwt.verify(tokenString, secret);
    if (typeof output == "string") {
        throw new Error("Token validation failed");
    }
    else {
        return output.sub;
    }
}
export function getBearerToken(req) {
    const authHeader = req.get("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new Error("Invalid Authorization header");
    }
    return authHeader.replace("Bearer ", "");
}
