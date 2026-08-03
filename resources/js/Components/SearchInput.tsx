import { router } from '@inertiajs/react';
import { useI18n } from '@/Utilities/i18n';
import { useEffect, useState } from 'react';

interface SearchInputProps {
    placeholder?: string;
    queryKey?: string;
    filters: Record<string, unknown>;
}

export default function SearchInput({
    placeholder,
    queryKey = 'search',
    filters,
}: SearchInputProps) {
    const { t } = useI18n();
    const resolvedPlaceholder = placeholder ?? t('search.placeholder');
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

    const clear = () => {
        setValue('');
        // The debounced effect only fires on the next tick when the value has
        // changed, so clearing navigates back to the unfiltered list too.
    };

    return (
        <div className="relative">
            <svg
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                aria-hidden="true"
            >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
                type="search"
                name={queryKey}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={resolvedPlaceholder}
                aria-label={resolvedPlaceholder}
                autoComplete="off"
                spellCheck={false}
                className="form-input w-full ps-10 pe-12 sm:w-64"
            />
            {value !== '' && (
                <button
                    type="button"
                    onClick={clear}
                    aria-label={t('search.clear')}
                    title={t('search.clear')}
                    className="absolute end-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-fg/40 transition-colors hover:bg-fg/[0.06] hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            )}
        </div>
    );
}
