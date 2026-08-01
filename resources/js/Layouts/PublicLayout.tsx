import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useLayoutEffect, useState } from 'react';
import FlashMessage from '@/Components/FlashMessage';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import AppearanceToggle from '@/Components/AppearanceToggle';
import FloatingContactButtons from '@/Components/FloatingContactButtons';
import { useI18n } from '@/Utilities/i18n';
import type { TranslationKey } from '@/Utilities/i18n';
import { useAppearance } from '@/Utilities/appearance';
import type { ShopProfile, ThemePalette } from '@/types/domain';

const NAV_LINKS: { label: TranslationKey; href: string }[] = [
    { label: 'nav.home', href: '/' },
    { label: 'nav.catalog', href: '/catalog' },
    { label: 'nav.gallery', href: '/gallery' },
    { label: 'nav.about', href: '/about' },
    { label: 'nav.contact', href: '/contact' },
];

/* Fallback palettes mirror the ShopSetting model defaults — they apply when
 * the settings row hasn't been seeded with palettes yet. */
const DARK_PALETTE = { accent: '#8a6d3b', background: '#0a0a0a', surface: '#121212', foreground: '#f4f4f1', muted: '#a4a4a0' };
const LIGHT_PALETTE = { accent: '#8a6d3b', background: '#f4f3ee', surface: '#ffffff', foreground: '#0a0a0a', muted: '#686864' };

/** Hex (#rrggbb) → rgba() string. Falls back to the raw value if not a 6-digit hex. */
function rgba(hex: string, alpha: number): string {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return hex;
    const value = parseInt(match[1], 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

interface ResolvedPalette {
    accent: string;
    background: string;
    surface: string;
    foreground: string;
    muted: string;
}

function resolvePalette(palette: ThemePalette | undefined, appearance: 'dark' | 'light'): ResolvedPalette {
    const fallback = appearance === 'light' ? LIGHT_PALETTE : DARK_PALETTE;
    if (!palette) return fallback;
    const p = appearance === 'light'
        ? {
              accent: palette.light_accent,
              background: palette.light_background,
              surface: palette.light_surface,
              foreground: palette.light_foreground,
              muted: palette.light_muted,
          }
        : {
              accent: palette.dark_accent,
              background: palette.dark_background,
              surface: palette.dark_surface,
              foreground: palette.dark_foreground,
              muted: palette.dark_muted,
          };
    return {
        accent: p.accent || fallback.accent,
        background: p.background || fallback.background,
        surface: p.surface || fallback.surface,
        foreground: p.foreground || fallback.foreground,
        muted: p.muted || fallback.muted,
    };
}

/**
 * Applies the active appearance (light/dark) as CSS custom properties on
 * <html>, so the semantic tokens that drive the body, headings, forms and the
 * liquid-glass surfaces all follow the palette saved on Profile settings.
 * Everything is restored on unmount so the admin stays untouched.
 */
function usePublicTheme(palette: ThemePalette | undefined, appearance: 'dark' | 'light') {
    useLayoutEffect(() => {
        const root = document.documentElement;
        const active = resolvePalette(palette, appearance);
        const line = rgba(active.foreground, 0.14);
        const lineStrong = rgba(active.foreground, 0.24);

        const vars: Record<string, string> = {
            // Accent (drives text-accent/bg-accent utilities via the runtime hook)
            '--color-accent': active.accent,
            '--color-accent-hover': active.accent,
            '--color-accent-active': active.accent,
            '--color-accent-soft': rgba(active.accent, 0.16),
            '--color-accent-runtime': active.accent,
            '--color-accent-soft-runtime': rgba(active.accent, 0.16),
            // Text
            '--color-foreground': active.foreground,
            '--color-foreground-soft': rgba(active.foreground, 0.75),
            '--color-foreground-muted': active.muted,
            '--color-foreground-faint': rgba(active.muted, 0.7),
            '--color-primary-text': active.foreground,
            '--color-secondary-text': rgba(active.foreground, 0.75),
            '--color-muted-text': active.muted,
            // Surfaces
            '--color-background': active.background,
            '--color-surface': active.surface,
            '--color-surface-strong': active.surface,
            '--color-hover': rgba(active.foreground, 0.06),
            '--color-border': line,
            '--color-border-strong': lineStrong,
        };

        if (appearance === 'light') {
            // Frosted-white glass instead of dark translucent panels.
            vars['--color-glass'] = 'rgba(255, 255, 255, 0.5)';
            vars['--color-glass-strong'] = 'rgba(255, 255, 255, 0.72)';
            vars['--shadow-glass'] = '0 1px 1px rgba(16, 24, 32, 0.04), 0 6px 20px rgba(16, 24, 32, 0.08)';
            vars['--shadow-glass-strong'] = '0 1px 1px rgba(16, 24, 32, 0.05), 0 12px 32px rgba(16, 24, 32, 0.12)';
            // Native form controls readable on a light canvas.
            vars['--input-bg'] = 'rgba(255, 255, 255, 0.55)';
            vars['--input-border'] = 'rgba(10, 10, 10, 0.16)';
            vars['--input-hover-bg'] = 'rgba(255, 255, 255, 0.7)';
            vars['--input-focus-border'] = 'rgba(10, 10, 10, 0.4)';
            vars['--input-focus-ring'] = 'rgba(10, 10, 10, 0.12)';
            vars['--input-placeholder'] = 'rgba(10, 10, 10, 0.45)';
        }

        const previous = new Map<string, string>();
        for (const name of Object.keys(vars)) {
            previous.set(name, root.style.getPropertyValue(name));
        }
        const previousScheme = root.style.colorScheme;

        for (const [name, value] of Object.entries(vars)) {
            root.style.setProperty(name, value);
        }
        root.style.colorScheme = appearance;

        return () => {
            for (const [name, value] of previous) {
                if (value) root.style.setProperty(name, value);
                else root.style.removeProperty(name);
            }
            root.style.colorScheme = previousScheme;
        };
    }, [palette, appearance]);
}

export default function PublicLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const { props } = usePage();
    const user = props.auth?.user ?? null;
    const shop = props.shop ?? null;
    const profile = (props.profile as ShopProfile | undefined) ?? null;
    const shopName = profile?.name_en || shop?.shop_name || 'Decore';
    const { t } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);
    const appearance = useAppearance();
    const palette = profile?.palette;

    usePublicTheme(palette, appearance);

    // Close the mobile menu with Escape, and re-lock when the route changes.
    useLayoutEffect(() => {
        if (!menuOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const glassOn = profile?.glass_effect_enabled ?? true;

    return (
        <div
            className="flex min-h-screen flex-col"
            data-glass={glassOn ? 'on' : 'off'}
            data-theme={appearance}
        >
            <Head title={title} />

            {/* ---- Header ---- */}
            <header className="sticky top-0 z-40 border-b border-line">
                <div className="liquid-glass-strong">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex min-w-0 items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                        >
                            {shop?.logo_url ? (
                                <img src={shop.logo_url} alt={shopName} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                                <span className="liquid-glass-strong flex h-9 w-9 items-center justify-center rounded-full">
                                    <span className="font-heading text-lg italic text-accent">{shopName.charAt(0).toUpperCase()}</span>
                                </span>
                            )}
                            <span className="truncate font-heading text-xl italic leading-none text-fg">{shopName}</span>
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex" aria-label={t('nav.main')}>
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-full px-4 py-2 text-sm font-medium text-fg/60 transition-colors duration-200 hover:bg-fg/[0.04] hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                                >
                                    {t(link.label)}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-3 md:flex">
                            <AppearanceToggle />
                            <LanguageSwitcher />
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-fg transition-all duration-200 hover:bg-fg/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                                >
                                    {t('common.open_dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-full px-4 py-2 text-sm font-medium text-fg/60 transition-colors duration-200 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                                    >
                                        {t('common.sign_in')}
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-fg transition-all duration-200 hover:bg-fg/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                                    >
                                        {t('nav.contact')}
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:hidden">
                            <AppearanceToggle />
                            <LanguageSwitcher />
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-expanded={menuOpen}
                                aria-controls="public-mobile-menu"
                                aria-label={t('nav.toggle_navigation')}
                                className="rounded-full p-2 text-fg/70 transition-colors hover:bg-fg/[0.05] hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                                    {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {menuOpen && (
                        <nav id="public-mobile-menu" className="border-t border-line px-4 py-3 md:hidden" aria-label={t('nav.main')}>
                            <div className="flex flex-col gap-1">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="rounded-full px-4 py-2.5 text-sm font-medium text-fg/60 transition-colors hover:bg-fg/[0.04] hover:text-fg"
                                    >
                                        {t(link.label)}
                                    </Link>
                                ))}
                                <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMenuOpen(false)}
                                            className="liquid-glass-strong flex-1 rounded-full px-5 py-2.5 text-center text-sm font-medium text-fg"
                                        >
                                            {t('common.open_dashboard')}
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex-1 rounded-full px-5 py-2.5 text-center text-sm font-medium text-fg/60"
                                            >
                                                {t('common.sign_in')}
                                            </Link>
                                            <Link
                                                href="/contact"
                                                onClick={() => setMenuOpen(false)}
                                                className="liquid-glass-strong flex-1 rounded-full px-5 py-2.5 text-center text-sm font-medium text-fg"
                                            >
                                                {t('nav.contact')}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </nav>
                    )}
                </div>
            </header>

            {/* ---- Body ---- */}
            <main className="flex-1">{children}</main>

            {/* ---- Footer ---- */}
            <footer className="border-t border-line">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
                    <div className="flex items-center gap-3">
                        {shop?.logo_url ? (
                            <img src={shop.logo_url} alt={shopName} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                            <span className="liquid-glass-strong flex h-8 w-8 items-center justify-center rounded-full">
                                <span className="font-heading text-sm italic text-accent">{shopName.charAt(0).toUpperCase()}</span>
                            </span>
                        )}
                        <div>
                            <p className="font-heading text-base italic text-fg">{shopName}</p>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-fg/35">
                                {shop?.tagline ?? t('public.tagline')}
                            </p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-6" aria-label={t('nav.footer')}>
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs font-medium uppercase tracking-[0.12em] text-fg/40 transition-colors hover:text-fg/80"
                            >
                                {t(link.label)}
                            </Link>
                        ))}
                    </nav>

                    <p className="text-xs text-fg/25">© {new Date().getFullYear()} {shopName}</p>
                </div>
            </footer>

            <FlashMessage />
            <FloatingContactButtons profile={profile} />
        </div>
    );
}
