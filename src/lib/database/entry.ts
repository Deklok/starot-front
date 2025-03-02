import { uploadFile } from "$lib/images/r2";
import { transformToCamelCase } from "$lib/utils/underToCamelCase";
import type { D1Database } from "@cloudflare/workers-types";

let db: D1Database;

async function getEntryAttributes(
    entryId: number
): Promise<EntryAttribute[]> {
    const result = await db.prepare(
        `SELECT * FROM entry_attribute
        WHERE entry_id = ?`
    ).bind(entryId)
    .all();

    const results = result.results;
    
    return results.map((r) => transformToCamelCase<EntryAttribute>(r));
}

async function getEntryImages(
    entryId: number
): Promise<EntryImage[]> {
    const result = await db.prepare(
        `SELECT * FROM entry_image
        WHERE entry_id = ?`
    ).bind(entryId)
    .all();

    const results = result.results;
    
    return results.map((r) => transformToCamelCase<EntryImage>(r));
}

async function getEntrySections(
    entryId: number
): Promise<EntrySection[]> {
    const result = await db.prepare(
        `SELECT * FROM entry_section
        WHERE entry_id = ?`
    ).bind(entryId)
    .all();

    const results = result.results;
    
    return results.map((r) => transformToCamelCase<EntrySection>(r));
}

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

    const entryParsed = transformToCamelCase<Entry>(result);
    const attributes = await getEntryAttributes(entryParsed.id);
    const images = await getEntryImages(entryParsed.id);
    const sections = await getEntrySections(entryParsed.id);

    return { 
        ...entryParsed,
        attributes,
        images,
        sections
    }
}

async function createEntryAttributes(
    entryId: number,
    attributes: EntryAttributeRequest[]
) {
    const values = attributes.map(() => `(?, ?, ?, ?)`).join(',');
    const bindings = attributes.flatMap(
        (i) => [entryId, i.label, i.value, i.displayOrder]
    );
    
    await db.prepare(`
        INSERT INTO
        entry_attribute(entry_id, label, value, display_order)
        VALUES ${values}
    `).bind(...bindings).run();
}

async function createEntryImages(
    entryId: number,
    images: EntryImageRequest[]
) {
    const values = images.map(() => `(?, ?, ?)`).join(',');
    const bindings = images.flatMap(
        (i) => [entryId, i.filePath, i.displayOrder]
    );
    
    await db.prepare(`
        INSERT INTO
        entry_image(entry_id, file_path, display_order)
        VALUES ${values}
    `).bind(...bindings).run();
}

async function createEntrySections(
    entryId: number,
    sections: EntrySectionRequest[]
) {
    const values = sections.map(() => `(?, ?, ?, ?)`).join(',');
    const bindings = sections.flatMap(
        (i) => [entryId, i.title, i.content, i.displayOrder]
    );
    
    await db.prepare(`
        INSERT INTO
        entry_section(entry_id, title, content, display_order)
        VALUES ${values}
    `).bind(...bindings).run();
}

export async function createEntry(
    dbInput: D1Database,
    itemId: number,
    entry: EntryRequest
): Promise<void> {
    db = dbInput;
    const result = await db.prepare(`
        INSERT INTO 
        entry(item_id, name, image_url) 
        VALUES (?,?,?,?)
    `).bind(itemId, entry.name, entry.image)
        .run();

    const entryId = result.meta.last_row_id;

    await createEntryAttributes(entryId, entry.attributes);
    await createEntryImages(entryId, entry.images);
    await createEntrySections(entryId, entry.sections);
}