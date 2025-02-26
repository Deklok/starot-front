/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	interface Locals {
		sessionId: string;
		userId?: number;
		username?: string;
	}
	interface Platform {
		env: Env
	}
	// interface Session {}
	// interface Stuff {}
}
