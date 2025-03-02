import { formatStringForURL } from "$lib/utils/formatUrl";
import { transformToCamelCase } from "$lib/utils/underToCamelCase";
import type { D1Database } from "@cloudflare/workers-types";

export async function createRootFolder(
    db: D1Database,
    name: string,
    worldId: number
): Promise<string> {
    const uniqueName = formatStringForURL(name);

    await db.prepare(`
        INSERT INTO 
        item(type, world_id, name, unique_name) 
        VALUES (?,?,?,?)
    `).bind('folder', worldId, name, uniqueName)
    .run();

    return uniqueName;
}

export async function getFolderItems(
    db: D1Database,
    worldId: number,
    id: number
): Promise<ItemWithPreview[]> {
    const results = await db.prepare(`
        SELECT item.*, image.file_path as preview, entry.image_url as entryPreview FROM item
        LEFT OUTER JOIN image on image.item_id = item.id
        LEFT OUTER JOIN entry on entry.item_id = item.id
        WHERE 
        world_id = ? AND 
        parent_id = ?
    `).bind(worldId, id).all();

    const items = results.results;

    return items.map((item) => transformToCamelCase<ItemWithPreview>(item));
}