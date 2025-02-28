import { formatStringForURL } from "$lib/utils/formatUrl";
import type { D1Database } from "@cloudflare/workers-types";

export async function createItem(
    db: D1Database,
    item: {
        name: string,
        uniqueName: string,
        type: string,
        worldId: number,
        parentId?: number
    }
): Promise<number> {
    const result = await db.prepare(`
        INSERT INTO 
        item (name, unique_name, type, world_id, parent_id) 
        VALUES (?,?,?,?,?)
    `).bind(item.name, item.uniqueName, item.type, item.worldId, 
        item.parentId ? item.parentId : null
    ).run();

    return result.meta.last_row_id;
}