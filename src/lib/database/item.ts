import { extractKeyFromURL } from "$lib/utils/formatUrl";
import { tryCatch } from "$lib/utils/trycatch";
import { transformToCamelCase } from "$lib/utils/underToCamelCase";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

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
        ORDER BY item.name ASC
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

export async function deleteItemById(
    db: D1Database,
    bucket: R2Bucket,
    id: number
): Promise<void> {
    const result = await db.prepare(`SELECT * FROM item WHERE id = ?`)
        .bind(id)
        .first();

    if (!result) {
        throw new Error('Item not found');
    }

    if (result.type === 'folder') {
        await deleteFolders(db, bucket, [id]);
    }

    if (result.type === 'image') {
        await deleteImages(db, bucket, [id]);
    }

    if (result.type === 'entry') {
        await deleteEntries(db, bucket, [id]);
    }
}

async function deleteFolders(
    db: D1Database,
    bucket: R2Bucket,
    itemIds: number[]
): Promise<void> {
    for (const itemId of itemIds) {
        // Find all child item IDs and their types
        const children = await db.prepare(`
            SELECT id, type FROM item WHERE parent_id = ?
        `).bind(itemId).all<{ id: number, type: string }>();

        // Recursively delete child folders first
        if (children.results.length > 0) {           
            const folderIds = children.results.filter(child => child.type === 'folder').map(child => child.id);
            const imagesIds = children.results.filter(child => child.type === 'image').map(child => child.id);
            const entriedIds = children.results.filter(child => child.type === 'entry').map(child => child.id);
            
            await deleteFolders(db, bucket, folderIds);
            await deleteImages(db, bucket, imagesIds);
            await deleteEntries(db, bucket, entriedIds);
        }

        // Delete item tags associated with the current item
        await db.prepare(`DELETE FROM item_tag WHERE item_id = ?`).bind(itemId).run();
        // Finally, delete the item itself
        await db.prepare(`DELETE FROM item WHERE id = ?`).bind(itemId).run();
    }
}

async function deleteEntries(
    db: D1Database,
    bucket: R2Bucket,
    itemIds: number[]
): Promise<void> {
    const ids = itemIds.join(', ');
    
    const entries = await db.prepare(`
        SELECT images,image_url FROM entry WHERE item_id IN (?)
        `).bind(ids).all();
    if (entries.error) {
        throw new Error('Error looking for entries');
    }

    const entryImages = entries.results.map(entry => JSON.parse(entry.images as string));

    const imagePaths = entryImages.reduce((acc, images) => {
        acc.push(...images.map((image: any) => image.filePath));
        return acc;
    }, []);
    const imageProfiles = entries.results.map(entry => entry.image_url as string);
    const bucketKeys = [...imagePaths, ...imageProfiles].map(url =>
        extractKeyFromURL(url)
    ).filter(key => key !== null);

    const {error} = await tryCatch(bucket.delete(bucketKeys));

    if (error) {
        console.log(error);
        throw new Error('Error deleting images from bucket');
    }

    const deleteEntry = 
        db.prepare(`DELETE FROM entry WHERE item_id IN (?)`)
        .bind(ids);
    const deleteEntryTags = 
        db.prepare(`DELETE FROM item_tag WHERE item_id IN (?)`)
        .bind(ids);

    await db.batch([deleteEntry, deleteEntryTags]);
    await db.prepare(`DELETE FROM item WHERE id IN (?)`).bind(ids).run();
}

async function deleteImages(
    db: D1Database,
    bucket: R2Bucket,
    itemIds: number[]
): Promise<void> {
    const ids = itemIds.join(', ');
    
    const images = await db.prepare(`
        SELECT file_path FROM image WHERE item_id IN (?)
        `).bind(ids).all();
    if (images.error) {
        throw new Error('Error looking for images');
    }

    const imageFilePaths = images.results.map(image => image.file_path as string);
    const bucketKeys = imageFilePaths.map(url =>
        extractKeyFromURL(url)
    ).filter(key => key !== null);

    const {error} = await tryCatch(bucket.delete(bucketKeys));
    
    if (error) {
        console.log(error);
        throw new Error('Error deleting images from bucket');
    }
    
    const deleteImage = 
        db.prepare(`DELETE FROM image WHERE item_id IN (?)`)
        .bind(ids);
    const deleteImageTags = 
        db.prepare(`DELETE FROM item_tag WHERE item_id IN (?)`)
        .bind(ids);

    await db.batch([deleteImage, deleteImageTags]);
    await db.prepare(`DELETE FROM item WHERE id IN (?)`).bind(ids).run();
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

    // Add ORDER BY name
    query += ` ORDER BY item.name ASC`;
    
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