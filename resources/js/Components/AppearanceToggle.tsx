import { useI18n } from '@/Utilities/i18n';
import { useAppearance, toggleAppearance } from '@/Utilities/appearance';

/**
 * Compact sun/moon pill for the public header. Shows the mode the visitor
 * will switch TO (sun in dark mode, moon in light mode) and persists the
 * choice per device via localStorage.
 */
export default function AppearanceToggle() {
    const { t } = useI18n();
    const appearance = useAppearance();
    const isDark = appearance === 'dark';
    const label = isDark ? t('theme.switch_to_light') : t('theme.switch_to_dark');

    return (
        <button
            type="button"
            onClick={toggleAppearance}
            aria-pressed={!isDark}
            aria-label={label}
            title={label}
            className="liquid-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg/70 transition-colors duration-200 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
        >
            {isDark ? (
                /* Sun — tap to switch to light */
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4l1.4-1.4" />
                </svg>
            ) : (
                /* Moon — tap to switch to dark */
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
                </svg>
            )}
        </button>
    );
}
