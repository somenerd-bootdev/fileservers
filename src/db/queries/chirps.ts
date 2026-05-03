import { sql } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
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
        .orderBy(sql`${chirps.createdAt} asc`);
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