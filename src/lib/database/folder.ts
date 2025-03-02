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
    id: number
): Promise<Item[]> {
    const results = await db.prepare(`
        SELECT * FROM item 
        WHERE 
        world_id = ? AND 
        parent_id IS NOT NULL
    `).bind(id).all();

    const items = results.results;

    return items.map((item) => transformToCamelCase<Item>(item));
}