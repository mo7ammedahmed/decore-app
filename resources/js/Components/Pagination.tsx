import { Link } from '@inertiajs/react';
import type { Paginated } from '@/types/domain';
import { useI18n } from '@/Utilities/i18n';

export default function Pagination<T>({ paginator }: { paginator: Paginated<T> }) {
    const { t } = useI18n();

    if (paginator.total === 0) return null;

    return (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-fg/40">
                {t('pagination.showing', {
                    from: paginator.from ?? 0,
                    to: paginator.to ?? 0,
                    total: paginator.total,
                })}
            </p>

            <nav className="flex flex-wrap items-center gap-1.5" aria-label={t('pagination.aria')}>
                {paginator.links.map((link, index) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={index}
                                className="rounded-full px-3 py-1.5 text-xs text-fg/25"
                                aria-hidden="true"
                            >
                                {link.label.replace(/&laquo;|&raquo;/g, '') || '…'}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                                link.active
                                    ? 'liquid-glass-strong text-fg'
                                    : 'text-fg/55 hover:bg-fg/[0.06] hover:text-fg'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </nav>
        </div>
    );
}
