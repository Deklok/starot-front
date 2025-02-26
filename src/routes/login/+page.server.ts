import { encryptString } from '$lib/database/auth';
import { login } from '$lib/database/user';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions = {
    login: async ({ cookies, request, platform, locals }) => {
        console.log('enter to login action');
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
            console.log('resultLogin', resultLogin);
            if (!resultLogin) {
                return fail(401);
            }
            cookies.set('session', encryptString(
                JSON.stringify(resultLogin)
            ) , {
                maxAge: 31536000, // 1 day
                path: '/',
            });
        } catch (err: any) {
            console.log('err on db query', err);
            return fail(500);
        }

        return redirect(303, '/');
    }
} satisfies Actions;