import { sql } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createChirp(chirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getAllChirpsOrderedbyCreatedAt() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(sql `${chirps.createdAt} asc`);
    return result;
}
export async function getAllChirpsOrderedbyCreatedAtForAuthor(authorId) {
    const result = await db
        .select()
        .from(chirps)
        .where(eq(chirps.userId, authorId))
        .orderBy(sql `${chirps.createdAt} asc`);
    return result;
}
export async function getChirpById(id) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, id));
    return result;
}
export async function deleteChirpById(id) {
    const [result] = await db
        .delete(chirps)
        .where(eq(chirps.id, id));
    return result;
}
export async function getAuthorForChirpById(id) {
    const [result] = await db
        .select({
        userId: chirps.userId
    })
        .from(chirps)
        .where(eq(chirps.id, id));
    return result;
}
