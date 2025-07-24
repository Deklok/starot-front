import { formatStringForURL } from "$lib/utils/formatUrl";
import { replaceEntryUniqueNameInUrl } from "$lib/utils/stringFormat";
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

export async function getEntryIdByUniqueName(
    dbInput: D1Database,
    uniqueName: string,
    worldUniqueName: string
): Promise<number> {
    db = dbInput;
    const result = await db.prepare(`
        SELECT id FROM entry
        WHERE item_id in (
            SELECT id FROM item WHERE unique_name = ? AND 
            world_id = (SELECT id FROM world WHERE unique_name = ?)
        )
    `).bind(uniqueName, worldUniqueName)
    .first();

    if (result === null) {
        throw new Error(`Entry not found`);
    }

    return result.id as number;
}

export async function createEntry(
    dbInput: D1Database,
    itemId: number,
    entry: EntryRequest
): Promise<void> {
    db = dbInput;
    const result = await db.prepare(`
        INSERT INTO 
        entry(item_id, name, image_url, attributes, images, sections, published) 
        VALUES (?,?,?,?,?,?,?)
    `).bind(
        itemId, 
        entry.name, 
        entry.image,
        JSON.stringify(entry.attributes),
        JSON.stringify(entry.images),
        JSON.stringify(entry.sections),
        entry.published
    ).run();

    if (!result.success) {
        throw new Error(`error on create entry`);
    }
}

export async function updateEntry(
    dbInput: D1Database,
    entryId: number,
    entry: Omit<EntryRequest, 'itemId'>
): Promise<void> {
    db = dbInput;
    await db.prepare(`
        UPDATE entry
        SET name = ?, image_url = ?, attributes = ?, images = ?, sections = ?, published = ?
        WHERE id = ?
    `).bind(
        entry.name,
        entry.image,
        JSON.stringify(entry.attributes),
        JSON.stringify(entry.images),
        JSON.stringify(entry.sections),
        entry.published,
        entryId
    ).run();

    await db.prepare(`
        UPDATE item
        SET name = ?, unique_name = ?
        WHERE id = (
            SELECT item_id FROM entry WHERE id = ?
    )`).bind(entry.name, formatStringForURL(entry.name), entryId).run();
    
}

export async function updateEntryUniqueNameByItemId(
    dbInput: D1Database,
    uniqueName: string,
    itemId: number
): Promise<void> {
    db = dbInput;
    const entry = await getEntry(db, itemId);

    let mainImageUrl: string = entry.imageUrl;
    let imagesUrl = entry.images;

    if (entry.imageUrl.includes('https://')) {
        mainImageUrl = replaceEntryUniqueNameInUrl(
            entry.imageUrl,
            uniqueName
        );
    }

    if (entry.images.length > 0) {
        imagesUrl = entry.images.map((image) => ({
            ...image,
            filePath: replaceEntryUniqueNameInUrl(image.filePath, uniqueName)
        }));
    }

    console.log('mainImageUrl', mainImageUrl);
    console.log('imagesUrl', imagesUrl);

    await db.prepare(`
        UPDATE entry
        SET image_url = ?, images = ?
        WHERE item_id = ?
    `).bind(mainImageUrl, JSON.stringify(imagesUrl), itemId).run();
}