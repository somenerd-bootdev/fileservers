import { sql } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { eq, asc, desc } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
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
        .orderBy(asc(sql`${chirps.createdAt}`));
    return result;
}

export async function getAllChirpsOrderedbyCreatedAtDESC() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(desc(sql`${chirps.createdAt}`));
    return result;
}

export async function getAllChirpsOrderedbyCreatedAtForAuthorASC(authorId: string) {
    const result = await db
        .select()
        .from(chirps)
        .where(eq(chirps.userId, authorId))
        .orderBy(asc(sql`${chirps.createdAt}`));
    return result;
}

export async function getAllChirpsOrderedbyCreatedAtForAuthorDESC(authorId: string) {
    const result = await db
        .select()
        .from(chirps)
        .where(eq(chirps.userId, authorId))
        .orderBy(desc(sql`${chirps.createdAt}`));
    return result;
}

export async function getChirpById(id: string) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, id));
    return result;
}

export async function deleteChirpById(id: string) {
    const [result] = await db
        .delete(chirps)
        .where(eq(chirps.id, id));
    return result;
}

export async function getAuthorForChirpById(id: string) {
    const [result] = await db
        .select({
            userId: chirps.userId
        })
        .from(chirps)
        .where(eq(chirps.id, id));
    return result;
}