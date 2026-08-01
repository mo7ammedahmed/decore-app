import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface SearchInputProps {
    placeholder?: string;
    queryKey?: string;
    filters: Record<string, unknown>;
}

export default function SearchInput({
    placeholder = 'Search…',
    queryKey = 'search',
    filters,
}: SearchInputProps) {
    const [value, setValue] = useState<string>((filters[queryKey] as string) ?? '');

    useEffect(() => {
        setValue((filters[queryKey] as string) ?? '');
    }, [filters, queryKey]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (value === ((filters[queryKey] as string) ?? '')) return;

            const params: Record<string, string> = {};
            for (const [key, val] of Object.entries(filters)) {
                if (typeof val === 'string' && val !== '') {
                    params[key] = val;
                }
            }

            if (value !== '') {
                params[queryKey] = value;
            }

            router.get(window.location.pathname, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="relative">
            <svg
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
            >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="form-input w-full ps-10 sm:w-64"
            />
        </div>
    );
}
