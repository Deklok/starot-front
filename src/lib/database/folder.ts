import { formatStringForURL } from "$lib/utils/formatUrl";
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