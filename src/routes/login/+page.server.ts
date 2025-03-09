import { encryptString } from '$lib/database/auth';
import { login } from '$lib/database/user';
import { isLoading } from '$lib/stores/loading';
import { error, fail, type Actions } from '@sveltejs/kit';

export const actions = {
    login: async ({ cookies, request, platform, locals }) => {
        isLoading.set(true);
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;
        
        if (!platform) {
            throw new Error('no platform loaded');
        }

        const DB = platform.env.DB;
        try {
            const resultLogin = await login(
                DB,
                username,
                password
            );

            if (!resultLogin) {
                return fail(401);
            }
            cookies.set('session', await encryptString(
                JSON.stringify(resultLogin)
            ) , {
                maxAge: 31536000, // 1 day
                path: '/',
            });
        } catch (err: any) {
            return error(500, err);
        }

        isLoading.set(false);
        return { success: true}
    }
} satisfies Actions;