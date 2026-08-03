import { usePage } from '@inertiajs/react';
import { useI18n, LOCALES } from '@/Utilities/i18n';
import type { Locale } from '@/Utilities/i18n';

/**
 * Compact pill toggle between the available locales. The list comes from the
 * server-shared `availableLocales` prop (mirroring config/app.php) with the
 * client constant as a fallback; the active segment is highlighted and shows
 * each language's native name.
 */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { locale, switchLocale } = useI18n();
    const { props } = usePage();
    const available = (props.availableLocales as Record<string, string> | undefined) ?? LOCALES;
    const locales = Object.keys(available) as Locale[];

    return (
        <div
            role="group"
            aria-label={LOCALES[locale]}
            className={`liquid-glass flex items-center rounded-full p-0.5 ${className}`}
        >
            {locales.map((code) => {
                const active = code === locale;

                return (
                    <button
                        key={code}
                        type="button"
                        onClick={() => switchLocale(code)}
                        aria-pressed={active}
                        className={`min-h-11 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                            active
                                ? 'liquid-glass-strong text-fg'
                                : 'text-fg/45 hover:text-fg'
                        }`}
                    >
                        {available[code]}
                    </button>
                );
            })}
        </div>
    );
}
