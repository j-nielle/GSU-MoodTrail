import { writable } from 'svelte/store';

export const newRequest = writable(false);
export const focusTable = writable(false);
export const consistentLowMoods = writable(new Map());