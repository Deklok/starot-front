import { writable } from "svelte/store";


export const currentWorld = writable<World | null>(null);