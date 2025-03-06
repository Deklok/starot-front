// src/lib/stores/sidebarStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Default to open on desktop, closed on mobile
// Only check window size in the browser environment
const initialState = browser ? window.innerWidth >= 1300 : true;

export const sidebarOpen = writable(initialState);