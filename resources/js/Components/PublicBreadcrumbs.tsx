import { Link } from '@inertiajs/react';
import { useI18n } from '@/Utilities/i18n';

interface Crumb {
    label: string;
    href?: string;
}

interface PublicBreadcrumbsProps {
    items: Crumb[];
    className?: string;
}

/**
 * Editorial breadcrumbs for guest pages (e.g. Catalog / Finish detail). The
 * final item is the current page and renders as plain text; links use logical
 * direction so the chevron mirrors correctly in RTL.
 */
export default function PublicBreadcrumbs({ items, className = '' }: PublicBreadcrumbsProps) {
    const { dir } = useI18n();
    const flip = dir === 'rtl' ? 'rotate-180' : '';

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                            {index > 0 && (
                                <svg
                                    className={`h-3.5 w-3.5 text-fg/25 ${flip}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M9 6l6 6-6 6" />
                                </svg>
                            )}
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="text-fg/50 transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-fg/80' : 'text-fg/50'}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
