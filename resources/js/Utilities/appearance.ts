import { useSyncExternalStore } from 'react';

/**
 * Public-site appearance (light/dark), persisted per device.
 *
 * A tiny module-level store so the header toggle and PublicLayout read the
 * same state. The choice lives in localStorage (per device), defaults to the
 * site's dark-cinematic look, and never touches the admin — the theme is only
 * applied while a public page (PublicLayout) is mounted.
 */
export type Appearance = 'dark' | 'light';

const STORAGE_KEY = 'decore.appearance';

function readStored(): Appearance {
    if (typeof window === 'undefined') return 'dark';
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch {
        return 'dark';
    }
}

let current: Appearance = readStored();

const listeners = new Set<() => void>();

function emit(): void {
    for (const listener of listeners) listener();
}

export function setAppearance(next: Appearance): void {
    if (next === current) return;
    current = next;
    try {
        window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
        // Private mode / storage blocked — the in-memory choice still applies.
    }
    emit();
}

export function toggleAppearance(): void {
    setAppearance(current === 'dark' ? 'light' : 'dark');
}

export function useAppearance(): Appearance {
    return useSyncExternalStore(
        (onChange) => {
            listeners.add(onChange);
            return () => listeners.delete(onChange);
        },
        () => current,
        () => 'dark',
    );
}
