import { decrypt } from '$lib/database/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session');

	if (session) {
		const jsonresult = JSON.parse(decrypt(session));
		event.locals.userId = jsonresult.id;
		event.locals.username = jsonresult.username;
	}
	
	const response = await resolve(event);

	return response;
};