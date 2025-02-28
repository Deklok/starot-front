import type { D1Database } from "@cloudflare/workers-types";

export async function createImage(
    db: D1Database,
    itemId: number,
    filePath: string
): Promise<void> {
    await db.prepare(`
        INSERT INTO 
        image(item_id, file_path) 
        VALUES (?,?)
    `).bind(itemId, filePath)
        .run();
}