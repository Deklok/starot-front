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

export async function moveItemToFolder(
    db: D1Database,
    itemId: number,
    folderId: number
): Promise<void> {
    const parentId = folderId === 0 ? null : folderId;
    await db.prepare(`
        UPDATE item
        SET parent_id = ?
        WHERE id = ?
    `).bind(parentId, itemId).run();
}

export async function getFolderStructure(
    db: D1Database,
    worldId: number
): Promise<Folder[]> {
    const results = await db.prepare(`
        SELECT * FROM item
        WHERE 
        world_id = ? AND
        type = 'folder'
    `).bind(worldId).all();

    const items = results.results.map(item => transformToCamelCase<Folder>(item));

    // Create a map for quick lookup of folders by ID
    const itemsMap = new Map<number, Folder>();
    items.forEach(item => {
        // Initialize children array for each folder
        item.children = [];
        itemsMap.set(item.id, item);
    });
    
    // Build the hierarchy
    const rootFolders: Folder[] = [];
    items.forEach(item => {
        if (!item.parentId) {
            // This is a root folder
            rootFolders.push(item);
        } else {
            // This is a child folder
            const parent = itemsMap.get(item.parentId);
            if (parent) {
                parent.children.push(item);
            }
        }
    });

    return rootFolders;
}