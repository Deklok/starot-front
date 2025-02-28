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