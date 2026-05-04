import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function deleteAllUsers() {
    await db.delete(users)
}

export async function getUserByEmail(email: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    return result;
}

export async function getUserById(userId: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
    return result;
}

export async function updateUser(user: NewUser) {
    const [result] = await db
        .update(users)
        .set({
            email: user.email,
            hashedPassword: user.hashedPassword,
            updatedAt: new Date(),
        })
        .where(eq(users.id, user.id || ""))
        .returning();
    return result;
}

export async function upgradeUserToRed(userId: string) {
    const [result] = await db
        .update(users)
        .set({
            isChirpyRed: true
        })
        .where(eq(users.id, userId))
        .returning();
    return result;
}
