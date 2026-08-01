import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PropsWithChildren } from 'react';
import FlashMessage from '@/Components/FlashMessage';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useI18n } from '@/Utilities/i18n';
import type { TranslationKey } from '@/Utilities/i18n';

const NAV_LINKS: { label: TranslationKey; href: string }[] = [
    { label: 'nav.home', href: '/' },
    { label: 'nav.catalog', href: '/catalog' },
    { label: 'nav.about', href: '/about' },
    { label: 'nav.contact', href: '/contact' },
];

export default function PublicLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const { props } = usePage();
    const user = props.auth?.user ?? null;
    const shop = props.shop ?? null;
    const shopName = shop?.shop_name || 'Decore';
    const { t } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close the mobile menu with Escape, and re-lock when the route changes.
    useEffect(() => {
        if (!menuOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={title} />

            {/* ---- Header ---- */}
            <header className="sticky top-0 z-40 border-b border-white/[0.06]">
                <div className="liquid-glass-strong">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex shrink-0 items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                            {shop?.logo_url ? (
                                <img src={shop.logo_url} alt={shopName} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                                <span className="liquid-glass-strong flex h-9 w-9 items-center justify-center rounded-full">
                                    <span className="font-heading text-lg italic text-accent">{shopName.charAt(0).toUpperCase()}</span>
                                </span>
                            )}
                            <span className="font-heading text-xl italic leading-none text-white">{shopName}</span>
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex" aria-label={t('nav.main')}>
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                >
                                    {t(link.label)}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-3 md:flex">
                            <LanguageSwitcher />
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                >
                                    {t('common.open_dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                    >
                                        {t('common.sign_in')}
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                    >
                                        {t('nav.contact')}
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:hidden">
                            <LanguageSwitcher />
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-expanded={menuOpen}
                                aria-controls="public-mobile-menu"
                                aria-label={t('nav.toggle_navigation')}
                                className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                                    {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {menuOpen && (
                        <nav id="public-mobile-menu" className="border-t border-white/[0.06] px-4 py-3 md:hidden" aria-label={t('nav.main')}>
                            <div className="flex flex-col gap-1">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="rounded-full px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                                    >
                                        {t(link.label)}
                                    </Link>
                                ))}
                                <div className="mt-3 flex items-center gap-3 border-t border-white/[0.06] pt-3">
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMenuOpen(false)}
                                            className="liquid-glass-strong flex-1 rounded-full px-5 py-2.5 text-center text-sm font-medium text-white"
                                        >
                                            {t('common.open_dashboard')}
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex-1 rounded-full px-5 py-2.5 text-center text-sm font-medium text-white/60"
                                            >
                                                {t('common.sign_in')}
                                            </Link>
                                            <Link
                                                href="/contact"
                                                onClick={() => setMenuOpen(false)}
                                                className="liquid-glass-strong flex-1 rounded-full px-5 py-2.5 text-center text-sm font-medium text-white"
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
            <footer className="border-t border-white/[0.06]">
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
                            <p className="font-heading text-base italic text-white">{shopName}</p>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                                {shop?.tagline ?? t('public.tagline')}
                            </p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-6" aria-label={t('nav.footer')}>
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs font-medium uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white/80"
                            >
                                {t(link.label)}
                            </Link>
                        ))}
                    </nav>

                    <p className="text-xs text-white/25">© {new Date().getFullYear()} {shopName}</p>
                </div>
            </footer>

            <FlashMessage />
        </div>
    );
}
