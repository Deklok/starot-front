import { writable } from "svelte/store";

export const parentId = writable<number | null>(null);
export const entryId = writable<number | null>(null);
export const itemId = writable<number | null>(null);
export const currentItem = writable<Item | null>(null);