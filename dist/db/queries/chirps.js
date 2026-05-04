import { sql } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";
import { eq, asc, desc } from "drizzle-orm";
export async function createChirp(chirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getAllChirpsOrderedbyCreatedAtASC() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(asc(sql `${chirps.createdAt}`));
    return result;
}
export async function getAllChirpsOrderedbyCreatedAtDESC() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(desc(sql `${chirps.createdAt}`));
    return result;
}
export async function getAllChirpsOrderedbyCreatedAtForAuthorASC(authorId) {
    const result = await db
        .select()
        .from(chirps)
        .where(eq(chirps.userId, authorId))
        .orderBy(asc(sql `${chirps.createdAt}`));
    return result;
}
export async function getAllChirpsOrderedbyCreatedAtForAuthorDESC(authorId) {
    const result = await db
        .select()
        .from(chirps)
        .where(eq(chirps.userId, authorId))
        .orderBy(desc(sql `${chirps.createdAt}`));
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
