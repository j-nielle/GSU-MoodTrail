import { writable } from 'svelte/store';

export const addNewUser = writable(false);
export const editUser = writable(false);
export const removeUser = writable(false);
export const newRequest = writable(false);
export const focusTable = writable(false);
export const consistentLowMoods = writable(new Map());