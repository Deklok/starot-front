import type { D1Database } from "@cloudflare/workers-types";

export async function associateTagsToItem(
    db: D1Database,
    itemId: number,
    tags: string[]
): Promise<void> {
    if (!tags || tags.length === 0) {
        return; // No tags to associate
    }

    // Insert or ignore tags and get their IDs
    const tagIds: number[] = [];
    for (const tag of tags) {
        await db.prepare(`
            INSERT OR IGNORE INTO 
            tag(name) 
            VALUES (?)
        `).bind(tag).run();

        // Get the last inserted ID
        const { results } = await db.prepare(`SELECT id FROM tag WHERE name = ?`).bind(tag).all();

        if (results && results.length > 0) {
            tagIds.push(results[0].id as number);
        }
    }

    // Associate tag IDs with item
    const itemTagValues = tagIds.map(() => `(?, ?)`).join(',');
    const itemTagBindings = tagIds.flatMap((tagId) => [itemId, tagId]);

    if(tagIds.length > 0) {
        await db.prepare(`
            INSERT OR IGNORE INTO
            item_tag(item_id, tag_id)
            VALUES ${itemTagValues}
        `).bind(...itemTagBindings).run();
    }
}

export async function updateItemTags(
    db: D1Database,
    itemId: number,
    tags: string[]
): Promise<void> {
    // Get the current tags for the item
    const currentTags = await getItemTags(db, itemId);
    
    // Find tags to add (exist in newTags but not in currentTags)
    const tagsToAdd = tags.filter(tag => !currentTags.includes(tag));
    
    // Find tags to remove (exist in currentTags but not in newTags)
    const tagsToRemove = currentTags.filter(tag => !tags.includes(tag));
    
    // Add new tags
    if (tagsToAdd.length > 0) {
        await associateTagsToItem(db, itemId, tagsToAdd);
    }
    
    // Remove old tags
    if (tagsToRemove.length > 0) {
        // First, get the IDs of tags to remove
        const tagQuery = await db.prepare(`
            SELECT id FROM tag WHERE name IN (${tagsToRemove.map(() => '?').join(',')})
        `).bind(...tagsToRemove).all();
        
        const tagIdsToRemove = tagQuery.results.map(result => result.id as number);
        
        if (tagIdsToRemove.length > 0) {
            // Then delete the item_tag associations
            await db.prepare(`
                DELETE FROM item_tag 
                WHERE item_id = ? AND tag_id IN (${tagIdsToRemove.map(() => '?').join(',')})
            `).bind(itemId, ...tagIdsToRemove).run();
            
            // Optionally, clean up orphaned tags (tags with no items associated)
            await db.prepare(`
                DELETE FROM tag
                WHERE id IN (
                    SELECT tag.id FROM tag
                    LEFT JOIN item_tag ON tag.id = item_tag.tag_id
                    WHERE item_tag.tag_id IS NULL
                )
            `).run();
        }
    }
}

export async function getItemTags(
    db: D1Database,
    itemId: number
): Promise<string[]> {
    const result = await db.prepare(
        `SELECT tag.name FROM item_tag
        INNER JOIN tag ON tag.id = item_tag.tag_id AND item_tag.item_id = ?`
    ).bind(itemId).all();

    const results = result.results;

    return results.map((r) => r.name as string);
}