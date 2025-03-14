import { formatStringForURL } from "$lib/utils/formatUrl";
import { transformToCamelCase } from "$lib/utils/underToCamelCase";
import type { D1Database } from "@cloudflare/workers-types";

export async function getWorlds(
    db: D1Database
): Promise<World[]> {
    const result = await db.prepare('SELECT * FROM world')
        .all();

    const worlds = result.results;
    
    return worlds.map((world) => transformToCamelCase<World>(world))
}

export async function getWorldByUniqueName(
    db: D1Database,
    uniqueName: string
): Promise<World> {
    const result = await db.prepare(`
        SELECT * FROM world 
        WHERE unique_name = ?`)
        .bind(uniqueName)
        .first();

    if (!result) {
        throw new Error('World not found with uniqueName');
    }

    return transformToCamelCase<World>(result);
}

export async function createWorld(
    db: D1Database,
    name: string,
    userId: number
): Promise<string> {
    const uniqueName = formatStringForURL(name);

    await db.prepare(`
        INSERT INTO 
        world(name, unique_name, user_id) 
        VALUES (?,?,?)
    `).bind(name, uniqueName, userId)
        .run();

    return uniqueName;
}

export async function getWorldItems(
    db: D1Database,
    id: number
): Promise<ItemWithPreview[]> {
    const results = await db.prepare(`
        SELECT item.*, image.file_path as preview, entry.image_url as entryPreview FROM item 
        LEFT OUTER JOIN image on image.item_id = item.id
        LEFT OUTER JOIN entry on entry.item_id = item.id
        WHERE world_id = ? AND parent_id IS NULL
    `).bind(id).all();

    const items = results.results;

    return items.map((item) => transformToCamelCase<ItemWithPreview>(item));
}