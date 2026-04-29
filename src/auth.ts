import argon2 from "argon2"

export async function hashPassword(password: string): Promise<string> {
    const result = await argon2.hash(password);
    return result;
}

export async function checkPasswordHash(hash: string, password: string): Promise<boolean> {
    const result = await argon2.verify(hash, password);
    return result;
}