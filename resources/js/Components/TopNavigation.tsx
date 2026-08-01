import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useState } from 'react';
import { roleKey, useI18n } from '@/Utilities/i18n';

export default function TopNavigation({ onMenuClick }: { onMenuClick: () => void }) {
    const { auth, shop } = usePage().props;
    const user = auth.user;
    const { t } = useI18n();

    return (
        <header className="sticky top-0 z-30 px-4 pt-4 lg:ps-72 lg:pe-8">
            <div className="liquid-glass flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
                        aria-label={t('shell.open_navigation')}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <Link href={route('dashboard')} className="font-heading text-lg italic text-white lg:hidden">
                        {shop?.shop_name || 'Decore'}
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher className="hidden sm:flex" />
                    {user?.role && (
                        <span className="hidden rounded-full bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-accent sm:inline-block">
                            {t(roleKey(user.role))}
                        </span>
                    )}

                    <Dropdown>
                        <Dropdown.Trigger className="items-center gap-2.5 rounded-full py-1 ps-1 pe-3 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                            <span className="liquid-glass-strong flex h-8 w-8 items-center justify-center rounded-full font-heading text-sm italic text-accent">
                                {user?.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="hidden text-sm font-medium text-white/80 sm:block">
                                {user?.name}
                            </span>
                            <svg className="h-4 w-4 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                {t('shell.profile_settings')}
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                            >
                                {t('common.log_out')}
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
