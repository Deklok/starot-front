import type { D1Database } from "@cloudflare/workers-types";
import { hashPassword, verifyPassword } from "./auth";

export async function login(
    db: D1Database,
    username: string,
    password: string
): Promise<User | null> {
    const user = await db.prepare('SELECT * FROM user WHERE username = ?')
        .bind(username)
        .first();

    console.log('user from database', user);

    if (!user) {
        return null;
    }

    let hashedPassword = user.password_hash;

    console.log('hashed password', hashedPassword);
    if (!hashedPassword) {
        hashedPassword = hashPassword(password);
        
        await db.prepare('UPDATE user SET password_hash = ? WHERE username = ?')
        .bind(hashedPassword, username)
        .run();
    }
    
    if (!verifyPassword(password, hashedPassword as string)) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        uniqueName: user.unique_name,
        createdAt: user.created_at   
    } as User
}

export async function selectUserById(
    db: D1Database,
    id: number
): Promise<User> {
    const user = await db.prepare('SELECT * FROM user WHERE id = ?')
        .bind(id)
        .first();
    
    if (!user) {
        throw new Error('User not found');
    }

    return {
        id: user.id,
        username: user.username,
        uniqueName: user.unique_name,
        createdAt: user.created_at   
    } as User
}