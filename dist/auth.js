import argon2 from "argon2";
export async function hashPassword(password) {
    const result = await argon2.hash(password);
    return result;
}
export async function checkPasswordHash(hash, password) {
    const result = await argon2.verify(hash, password);
    return result;
}
