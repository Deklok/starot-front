import { formatStringForURL } from "$lib/utils/formatUrl";
import { transformToCamelCase } from "$lib/utils/underToCamelCase";
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

export async function getItem(
    db: D1Database,
    worldUniqueName: string,
    itemUniqueName: string,
    itemType: string
): Promise<Item> {
    const result = await db.prepare(`
        SELECT item.* FROM item
        INNER JOIN world on world.id = item.world_id
        WHERE item.unique_name = ? AND
        world.unique_name = ? AND
        item.type = ?
    `)
        .bind(itemUniqueName, worldUniqueName, itemType)
        .first();

    if (!result) {
        throw new Error('Item not found');
    }

    return transformToCamelCase<Item>(result);
}