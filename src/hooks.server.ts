import { decrypt } from '$lib/database/auth';
import type { Handle } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { currentWorld } from '$lib/stores/world';
import { getWorldByUniqueName } from '$lib/database/world';
import { currentItem, entryId } from '$lib/stores/item';
import { getItem } from '$lib/database/item';
import { getEntryIdByUniqueName } from '$lib/database/entry';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		const session = event.cookies.get('session');

		if (session) {
			const jsonresult = JSON.parse(await decrypt(session));
			event.locals.userId = jsonresult.id;
			event.locals.username = jsonresult.username;
		} else {
			event.locals.userId = undefined;
			event.locals.username = undefined;
		}

		if (Object.keys(event.params).length > 0) {
			if (!event.platform) {
				throw new Error('no platform loaded');
			}

			const DB = event.platform.env.DB;

			// Double check world set on storage
			if (event.params.world) {
				const world = get(currentWorld);
				if (world === null || world.uniqueName !== event.params.world) {
					const newWorld = await getWorldByUniqueName(DB, event.params.world);
					currentWorld.set(newWorld);
				}
			}

			// Double check current item on storage
			if (event.params.item) {
				const item = get(currentItem);
				if (item === null || item.uniqueName !== event.params.item) {
					const typeItem = event.url.searchParams.get('type') || 'entry';
					const newItem = await getItem(
						DB, 
						event.params.world as string, 
						event.params.item,
						typeItem
					);
					currentItem.set(newItem);
				}
			}

			// Double check current entry on storage
			if (event.params.entry) {
				const eId = get(entryId);
				if (eId === null) {
					const entry = await getEntryIdByUniqueName(
						DB,
						event.params.entry,
						event.params.world as string
					);
					entryId.set(entry);
				}
			}
		}
		console.log('stores currently: ', {
			world: get(currentWorld),
			item: get(currentItem),
			entry: get(entryId)
		});
		
		const response = await resolve(event);

		return response;
	} catch (error: any) {
		console.error('Global server error:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            path: event.url.pathname,
            timestamp: new Date().toISOString()
        });
        throw error;
	}
};