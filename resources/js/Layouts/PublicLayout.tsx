import { Head, Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PropsWithChildren, useEffect, useLayoutEffect, useState } from 'react';
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

/** Pick the higher-contrast black/white foreground for a configurable accent. */
function contrastText(hex: string): '#000000' | '#ffffff' {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return '#000000';

    const value = parseInt(match[1], 16);
    const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    const blackContrast = (luminance + 0.05) / 0.05;
    const whiteContrast = 1.05 / (luminance + 0.05);

    return whiteContrast > blackContrast ? '#ffffff' : '#000000';
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
            '--color-on-accent-runtime': contrastText(active.accent),
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
        const previousTheme = root.dataset.theme;
        const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        const previousThemeColor = themeMeta?.getAttribute('content') ?? null;

        for (const [name, value] of Object.entries(vars)) {
            root.style.setProperty(name, value);
        }
        root.style.colorScheme = appearance;
        root.dataset.theme = appearance;
        themeMeta?.setAttribute('content', active.background);

        return () => {
            for (const [name, value] of previous) {
                if (value) root.style.setProperty(name, value);
                else root.style.removeProperty(name);
            }
            root.style.colorScheme = previousScheme;
            if (previousTheme === undefined) delete root.dataset.theme;
            else root.dataset.theme = previousTheme;
            if (themeMeta && previousThemeColor !== null) themeMeta.setAttribute('content', previousThemeColor);
        };
    }, [palette, appearance]);
}

/** `tel:` href — keep only digits, with a single leading + when present. */
function telHref(phone: string): string {
    const trimmed = phone.trim();
    const digits = trimmed.replace(/\D/g, '');
    return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`;
}

/** WhatsApp href — full URL passes through, bare numbers become wa.me/<digits>. */
function waHref(whatsapp: string): string {
    const value = whatsapp.trim();
    if (/^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : value;
}

export default function PublicLayout({
    children,
    title,
    transparentHeader = false,
}: PropsWithChildren<{ title?: string; transparentHeader?: boolean }>) {
    const { props } = usePage();
    const user = props.auth?.user ?? null;
    const shop = props.shop ?? null;
    const profile = (props.profile as ShopProfile | undefined) ?? null;
    const shopName = profile?.name_en || shop?.shop_name || 'Decore';
    const collections = (props.public_collections as { id: number; name_en: string; name_ar?: string | null; slug: string }[] | undefined) ?? [];
    const { t, locale } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const appearance = useAppearance();
    const palette = profile?.palette;

    usePublicTheme(palette, appearance);

    // Track scroll so the landing header can drop from transparent → solid.
    useEffect(() => {
        if (!transparentHeader) return;
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [transparentHeader]);

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
    const isLandingTransparent = transparentHeader && !scrolled && !menuOpen;
    const headerClass = isLandingTransparent
        ? 'bg-transparent'
        : 'border-b border-line bg-canvas/85 backdrop-blur-xl';

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isActive = (href: string) =>
        href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`);

    // Footer contact details — DB-provided, never hardcoded.
    const phone = profile?.phone?.trim() || shop?.phone?.trim() || '';
    const email = profile?.email?.trim() || shop?.email?.trim() || '';
    const whatsapp = profile?.whatsapp?.trim() || '';
    const address = [shop?.address, shop?.city].filter(Boolean).join(', ');
    const socials = [
        { href: profile?.linkedin?.trim(), label: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4V8h4v1.5A5 5 0 0116 8zM4 9h4v12H4zM6 4a2 2 0 100 4 2 2 0 000-4z' },
        { href: profile?.github?.trim(), label: 'GitHub', path: 'M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21' },
        { href: profile?.website?.trim(), label: 'Website', path: 'M12 3a9 9 0 100 18 9 9 0 000-18zm-9 9a9 9 0 0118 0M3.6 9h16.8M3.6 15h16.8' },
    ].filter((s) => s.href) as { href: string; label: string; path: string }[];

    const localizedName = (item: { name_en: string; name_ar?: string | null }) =>
        locale === 'ar' && item.name_ar ? item.name_ar : item.name_en;

    return (
        <div
            className="flex min-h-screen flex-col"
            data-glass={glassOn ? 'on' : 'off'}
            data-theme={appearance}
        >
            <Head title={title} />

            <a
                href="#public-main-content"
                onClick={() => document.getElementById('public-main-content')?.focus()}
                className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-canvas focus:px-5 focus:py-3 focus:text-sm focus:text-fg focus:ring-2 focus:ring-accent"
            >
                {t('shell.skip_to_content')}
            </a>

            {/* ---- Header ---- */}
            <header className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${headerClass}`}>
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex min-h-11 min-w-0 items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                    >
                        {shop?.logo_url ? (
                            <img src={shop.logo_url} alt={shopName} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface">
                                <span className="font-heading text-lg italic text-accent">{shopName.charAt(0).toUpperCase()}</span>
                            </span>
                        )}
                        <span className="hidden truncate font-heading text-xl italic leading-none text-fg min-[430px]:inline">{shopName}</span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex" aria-label={t('nav.main')}>
                        {NAV_LINKS.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                                        active ? 'text-fg' : 'text-fg/55 hover:text-fg'
                                    }`}
                                >
                                    {t(link.label)}
                                    {active && (
                                        <span className="absolute inset-x-4 -bottom-0.5 h-px bg-accent" aria-hidden="true" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-2.5 lg:flex">
                        <AppearanceToggle />
                        <LanguageSwitcher />
                        <Link
                            href={user ? '/dashboard' : '/catalog'}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                        >
                            {user ? t('common.open_dashboard') : t('header.explore_materials')}
                            <svg className="h-4 w-4 rtl:-scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <AppearanceToggle />
                        <LanguageSwitcher />
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-expanded={menuOpen}
                            aria-controls="public-mobile-menu"
                            aria-label={menuOpen ? t('nav.close_navigation') : t('nav.toggle_navigation')}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-fg/70 transition-colors hover:bg-fg/[0.05] hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
                                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.nav
                            id="public-mobile-menu"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="overflow-hidden border-t border-line bg-canvas/95 backdrop-blur-xl lg:hidden"
                            aria-label={t('nav.main')}
                        >
                            <div className="flex flex-col gap-1 px-4 py-4">
                                {NAV_LINKS.map((link) => {
                                    const active = isActive(link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMenuOpen(false)}
                                            aria-current={active ? 'page' : undefined}
                                            className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                                active ? 'bg-fg/[0.06] text-fg' : 'text-fg/60 hover:bg-fg/[0.04] hover:text-fg'
                                            }`}
                                        >
                                            {t(link.label)}
                                        </Link>
                                    );
                                })}
                                <div className="mt-3 border-t border-line pt-3">
                                    <Link
                                        href={user ? '/dashboard' : '/catalog'}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent"
                                    >
                                        {user ? t('common.open_dashboard') : t('header.explore_materials')}
                                    </Link>
                                </div>
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>

            {/* ---- Body ---- */}
            <main id="public-main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>

            {/* ---- Footer ---- */}
            <footer className="mt-24 border-t border-line bg-surface/40">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3">
                                {shop?.logo_url ? (
                                    <img src={shop.logo_url} alt={shopName} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface">
                                        <span className="font-heading text-base italic text-accent">{shopName.charAt(0).toUpperCase()}</span>
                                    </span>
                                )}
                                <div>
                                    <p className="font-heading text-xl italic text-fg">{shopName}</p>
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-fg/40">
                                        {shop?.tagline ?? t('public.tagline')}
                                    </p>
                                </div>
                            </div>
                            {(profile?.short_pitch_en || profile?.short_pitch_ar) && (
                                <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg/55">
                                    {locale === 'ar' && profile?.short_pitch_ar ? profile.short_pitch_ar : profile?.short_pitch_en}
                                </p>
                            )}
                            {socials.length > 0 && (
                                <div className="mt-6 flex items-center gap-3">
                                    {socials.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.label}
                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-fg/55 transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <path d={social.path} />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Explore */}
                        <nav aria-label={t('footer.explore')}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg/40">{t('footer.explore')}</p>
                            <ul className="mt-5 space-y-3">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm text-fg/60 transition-colors hover:text-fg">
                                            {t(link.label)}
                                        </Link>
                                    </li>
                                ))}
                                {!user && (
                                    <li>
                                        <Link href="/login" className="text-sm text-fg/40 transition-colors hover:text-fg/80">
                                            {t('footer.staff_sign_in')}
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </nav>

                        {/* Collections */}
                        {collections.length > 0 && (
                            <nav aria-label={t('footer.collections')}>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg/40">{t('footer.collections')}</p>
                                <ul className="mt-5 space-y-3">
                                    {collections.map((collection) => (
                                        <li key={collection.id}>
                                            <Link
                                                href={route('catalog', { classification: collection.id })}
                                                className="text-sm text-fg/60 transition-colors hover:text-fg"
                                            >
                                                {localizedName(collection)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}

                        {/* Contact */}
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg/40">{t('footer.contact')}</p>
                            <ul className="mt-5 space-y-3 text-sm text-fg/60">
                                {phone && (
                                    <li>
                                        <a href={telHref(phone)} className="transition-colors hover:text-fg" dir="ltr">
                                            {phone}
                                        </a>
                                    </li>
                                )}
                                {email && (
                                    <li>
                                        <a href={`mailto:${email}`} className="transition-colors hover:text-fg" dir="ltr">
                                            {email}
                                        </a>
                                    </li>
                                )}
                                {whatsapp && (
                                    <li>
                                        <a
                                            href={waHref(whatsapp)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transition-colors hover:text-fg"
                                        >
                                            WhatsApp
                                        </a>
                                    </li>
                                )}
                                {address && <li>{address}</li>}
                                <li className="text-fg/40">
                                    {t('footer.working_hours')}: {t('contact.hours_value')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
                        <p className="text-xs text-fg/35">
                            © {new Date().getFullYear()} {shopName} — {t('footer.rights')}
                        </p>
                        {user ? (
                            <Link href="/dashboard" className="text-xs text-fg/45 transition-colors hover:text-fg/80">
                                {t('common.open_dashboard')}
                            </Link>
                        ) : (
                            <Link href="/login" className="text-xs text-fg/35 transition-colors hover:text-fg/70">
                                {t('footer.staff_sign_in')}
                            </Link>
                        )}
                    </div>
                </div>
            </footer>

            <FlashMessage />
            <FloatingContactButtons profile={profile} />
        </div>
    );
}
