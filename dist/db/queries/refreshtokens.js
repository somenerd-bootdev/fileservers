import { db } from "../index.js";
import { refreshTokens } from "../schema.js";
import { eq, and, gt, isNull } from "drizzle-orm";
export async function createRefreshToken(refreshToken) {
    const [result] = await db
        .insert(refreshTokens)
        .values(refreshToken)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getUserFromRefreshToken(token) {
    const [result] = await db
        .select({
        userId: refreshTokens.userId
    })
        .from(refreshTokens)
        .where(and(eq(refreshTokens.token, token), isNull(refreshTokens.revokedAt), gt(refreshTokens.expiresAt, new Date())));
    return result;
}
export async function revokeRefreshToken(token) {
    const currentTimeStamp = new Date();
    const [result] = await db
        .update(refreshTokens)
        .set({
        revokedAt: currentTimeStamp,
        updatedAt: currentTimeStamp
    })
        .where(eq(refreshTokens.token, token))
        .returning();
    return result;
}
