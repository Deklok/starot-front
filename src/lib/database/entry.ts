import { transformToCamelCase } from "$lib/utils/underToCamelCase";
import type { D1Database } from "@cloudflare/workers-types";

let db: D1Database;

export async function getEntry(
    dbInput: D1Database,
    itemId: number
): Promise<Entry> {
    db = dbInput;
    const result = await db.prepare(`
        SELECT * FROM entry
        WHERE item_id = ?
    `).bind(itemId)
    .first();

    if (result === null) {
        throw new Error(`Entry not found`);
    }

    const attributes = JSON.parse(result.attributes as string);
    const images = JSON.parse(result.images as string);
    const sections = JSON.parse(result.sections as string);

    const entryParsed = transformToCamelCase<Entry>({
        ...result,
        attributes,
        images,
        sections
    });

    return entryParsed;
}

export async function createEntry(
    dbInput: D1Database,
    itemId: number,
    entry: EntryRequest
): Promise<void> {
    db = dbInput;
    const result = await db.prepare(`
        INSERT INTO 
        entry(item_id, name, image_url, attributes, images, sections) 
        VALUES (?,?,?,?,?,?)
    `).bind(
        itemId, 
        entry.name, 
        entry.image,
        JSON.stringify(entry.attributes),
        JSON.stringify(entry.images),
        JSON.stringify(entry.sections)
    ).run();

    if (!result.success) {
        console.log(result.error);
        throw new Error(`error on create entry`);
    }
}

export async function updateEntry(
    dbInput: D1Database,
    entryId: number,
    entry: Omit<EntryRequest, 'itemId'>
): Promise<void> {

}