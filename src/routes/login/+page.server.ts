import { encryptString } from '$lib/database/auth';
import { login } from '$lib/database/user';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions = {
    login: async ({ cookies, request, platform, locals }) => {

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

            return fail(500);
        }

        return redirect(303, '/');
    }
} satisfies Actions;