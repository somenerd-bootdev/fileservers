import { db } from "../index.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createUser(user) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function deleteAllUsers() {
    await db.delete(users);
}
export async function getUserByEmail(email) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    return result;
}
export async function getUserById(userId) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
    return result;
}
export async function updateUser(user) {
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
export async function upgradeUserToRed(userId) {
    const [result] = await db
        .update(users)
        .set({
        isChirpyRed: true
    })
        .where(eq(users.id, userId))
        .returning();
    return result;
}
