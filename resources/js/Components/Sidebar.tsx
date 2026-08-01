import { Link, usePage } from '@inertiajs/react';
import { navigationFor } from '@/Utilities/navigation';
import { roleKey, useI18n } from '@/Utilities/i18n';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

const ICONS: Record<string, string> = {
    grid: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    truck: 'M8 16a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2zm9 0a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2zM2 5h11v9H2V5zm11 4h4l3 3v2h-7V9z',
    tags: 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    layers: 'M4 5l8-3 8 3-8 3-8-3zm0 5l8 3 8-3M4 15l8 3 8-3',
    users2: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    receipt: 'M9 14l6 0M9 17h6M7 3h10a1 1 0 011 1v17l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V4a1 1 0 011-1z',
    wallet: 'M19 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-2m-8-6h8a1 1 0 011 1v4a1 1 0 01-1 1h-8a1 1 0 01-1-1v-4a1 1 0 011-1zm4 2v1',
    percent: 'M9 17L17 9M9.5 8.5h.01M14.5 15.5h.01M8 7a1 1 0 11-2 0 1 1 0 012 0zm10 10a1 1 0 11-2 0 1 1 0 012 0z',
    coins: 'M12 8c-3.866 0-7-1.343-7-3s3.134-3 7-3 7 1.343 7 3-3.134 3-7 3zm0 0v4m0 0c3.866 0 7-1.343 7-3M12 12c-3.866 0-7 1.343-7 3s3.134 3 7 3 7-1.343 7-3-3.134-3-7-3z',
    swap: 'M8 7h11m0 0l-3-3m3 3l-3 3M16 17H5m0 0l3 3m-3-3l3-3',
    chart: 'M3 3v18h18M8 17V9m4 8V5m4 12v-6',
    scroll: 'M9 12h6m-6 4h6M9 8h4M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z',
    cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
    type: 'M4 6h16M4 12h10M4 18h16',
    image: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13.5 9.5l-4-4-3 3-4-4-5 5V6h16v13.5z',
    radar: 'M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0zm3-9a9 9 0 00-9 9m9-9v2m-9 7h2m14-2a9 9 0 01-9 9m9-9h-2m-7 9v-2m-4-5a9 9 0 009-9M6.3 6.3a9 9 0 0111.4 0M5.6 5.6a11 11 0 0112.8 0',
};

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { props, url } = usePage();
    const { auth, permissions, shop } = props;
    const { t } = useI18n();
    const shopName = shop?.shop_name || 'Decore';
    // Reactive on every Inertia navigation — a one-shot useEffect would go stale.
    // Strip the query string so strict comparisons survive filter params (?period=, ?search=).
    const currentPath = url.split('?')[0];

    // The server sends permission flags as presentation hints — only render
    // nav items the current role is actually allowed to open.
    const items = navigationFor(permissions).filter((item) => item.visible);

    return (
        <aside
            className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col transition-transform duration-300 lg:translate-x-0 ${
                open
                    ? 'translate-x-0 rtl:translate-x-0'
                    : '-translate-x-full rtl:translate-x-full'
            }`}
        >
            <div className="liquid-glass-strong flex h-full flex-col rounded-e-[1.5rem]">
                <div className="flex items-center gap-3 px-6 py-6">
                    {shop?.logo_url ? (
                        <img src={shop.logo_url} alt={shopName} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="liquid-glass-strong flex h-10 w-10 items-center justify-center rounded-full">
                            <span className="font-heading text-lg italic text-accent">{shopName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <div>
                        <p className="font-heading text-xl italic leading-none text-white">{shopName}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                            {shop?.tagline ?? t('nav.materials_atelier')}
                        </p>
                    </div>
                </div>

                <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-4 pb-6">
                    {items.map((item) => {
                        const active = item.route === 'dashboard'
                            ? currentPath === '/dashboard'
                            : currentPath.startsWith(`/${item.route.split('.').join('/').split('/')[0]}`) ||
                              (item.route === 'invoices.index' && (currentPath.startsWith('/invoices') || currentPath.startsWith('/payments')));

                        return (
                            <Link
                                key={item.key ?? item.route}
                                href={route(item.route)}
                                onClick={onClose}
                                className={`group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                                    active
                                        ? 'liquid-glass-strong text-white'
                                        : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                                }`}
                            >
                                <svg
                                    className="h-[18px] w-[18px] shrink-0 opacity-80"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.6}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d={ICONS[item.icon] ?? ICONS.grid} />
                                </svg>
                                {t(item.labelKey)}
                            </Link>
                        );
                    })}
                </nav>

                <div className="space-y-3 border-t border-white/[0.06] px-6 py-4">
                    {/* The top bar hides the switcher below sm — this drawer is the mobile home for it. */}
                    <div className="lg:hidden">
                        <LanguageSwitcher />
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                            {auth.user ? t(roleKey(auth.user.role)) : ''}
                        </p>
                        {auth.user?.supplier_id && (
                            <p className="mt-0.5 text-[11px] text-white/25">
                                {t('nav.supplier_id', { id: auth.user.supplier_id })}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
