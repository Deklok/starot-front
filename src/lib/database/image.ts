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

export async function getImageForItem(
    db: D1Database,
    itemId: number
): Promise<string> {
    const result = await db.prepare(`
        SELECT file_path FROM image
        WHERE item_id = ?
    `).bind(itemId)
    .first();

    if (!result) {
        throw new Error(`Image not found for item`)
    }

    return result.file_path as string;
}