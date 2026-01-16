import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const sidebarStore = (() => {
    const { subscribe, set, update } = writable(
        browser ? JSON.parse(localStorage.getItem('sidebar-collapsed') || 'false') : false
    );

    // Auto-persist to localStorage
    if (browser) {
        subscribe(value => {
            localStorage.setItem('sidebar-collapsed', JSON.stringify(value));
        });
    }

    return {
        subscribe,
        set,
        toggle: () => update(n => !n),
        collapse: () => update(() => true),
        expand: () => update(() => false)
    };
})();