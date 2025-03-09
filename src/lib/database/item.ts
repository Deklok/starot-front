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

export async function searchItems(
    db: D1Database,
    options: {
        worldId?: number,
        worldUniqueName?: string,
        searchTerm?: string,
        tags?: string[],
        type?: string,
        parentId?: number,
        limit?: number,
        offset?: number
    }
): Promise<ItemSearchResult[]> {
    let query = `
        SELECT DISTINCT 
            item.*, 
            world.name as world_name, 
            world.unique_name as world_unique_name,
            image.file_path as image_preview,
            entry.image_url as entry_preview
        FROM item
        INNER JOIN world ON world.id = item.world_id
        LEFT OUTER JOIN image ON image.item_id = item.id
        LEFT OUTER JOIN entry ON entry.item_id = item.id
    `;
    
    const bindings: (string | number)[] = [];
    const conditions: string[] = [];
    
    // Add worldUniqueName condition if provided
    if (options.worldUniqueName) {
        conditions.push(`world.unique_name = ?`);
        bindings.push(options.worldUniqueName);
    }
    
    // Join with item_tag table if tags are provided
    if (options.tags && options.tags.length > 0) {
        query += ` INNER JOIN item_tag ON item.id = item_tag.item_id
                  INNER JOIN tag ON item_tag.tag_id = tag.id`;
        
        // Create a condition for each tag using IN clause
        conditions.push(`tag.name IN (${options.tags.map(() => '?').join(', ')})`);
        bindings.push(...options.tags);
    }
    
    // Add search term condition (partial match for name)
    if (options.searchTerm) {
        conditions.push(`item.name LIKE ?`);
        bindings.push(`%${options.searchTerm}%`);
    }
    
    // Add worldId condition
    if (options.worldId !== undefined) {
        conditions.push(`item.world_id = ?`);
        bindings.push(options.worldId);
    }
    
    // Add type condition
    if (options.type) {
        conditions.push(`item.type = ?`);
        bindings.push(options.type);
    }
    
    // Add parentId condition
    if (options.parentId !== undefined) {
        conditions.push(`item.parent_id = ?`);
        bindings.push(options.parentId);
    }
    
    // Add WHERE clause if we have conditions
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add limit and offset
    if (options.limit !== undefined) {
        query += ` LIMIT ?`;
        bindings.push(options.limit);
        
        if (options.offset !== undefined) {
            query += ` OFFSET ?`;
            bindings.push(options.offset);
        }
    }
    
    const result = await db.prepare(query)
        .bind(...bindings)
        .all();
        
    return result.results.map(item => transformToCamelCase<ItemSearchResult>(item));
}