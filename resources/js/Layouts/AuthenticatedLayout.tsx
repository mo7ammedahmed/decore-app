import Sidebar from '@/Components/Sidebar';
import TopNavigation from '@/Components/TopNavigation';
import FlashMessage from '@/Components/FlashMessage';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { useI18n } from '@/Utilities/i18n';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useI18n();

    // Close the mobile drawer with Escape for keyboard users.
    useEffect(() => {
        if (!sidebarOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-black focus:px-5 focus:py-2.5 focus:text-sm focus:text-white focus:ring-2 focus:ring-white/30"
            >
                {t('shell.skip_to_content')}
            </a>

            <div className="hidden lg:block">
                <Sidebar open onClose={() => setSidebarOpen(false)} />
            </div>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <TopNavigation onMenuClick={() => setSidebarOpen(true)} />

            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label={t('shell.close_navigation')}
                />
            )}

            <main id="main-content" tabIndex={-1} className="px-4 pb-16 pt-8 outline-none sm:px-8 lg:ps-80 lg:pe-10">
                {header}
                {children}
            </main>

            <FlashMessage />
        </div>
    );
}
