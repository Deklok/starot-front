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
    itemType: string,
    parentId?: number
): Promise<Item> {
    let query = `
        SELECT item.* FROM item
        INNER JOIN world on world.id = item.world_id
        WHERE item.unique_name = ? AND
        world.unique_name = ? AND
        item.type = ?
    `;

    const bindings: (string | number)[] = [itemUniqueName, worldUniqueName, itemType];

    if (parentId !== undefined) {
        query += ` AND item.parent_id = ?`;
        bindings.push(parentId);
    }

    const result = await db.prepare(query)
        .bind(...bindings)
        .first();

    if (!result) {
        throw new Error('Item not found');
    }

    return transformToCamelCase<Item>(result);
}