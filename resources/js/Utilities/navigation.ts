import type { Permissions } from '@/types/domain';

import type { TranslationKey } from '@/Utilities/i18n';

export interface NavItem {
    /** Translation key — resolved through useI18n() when rendering. */
    labelKey: TranslationKey;
    route: string;
    icon: string;
    visible: boolean;
    /** Stable React key. Defaults to the route name; override when two items share a route. */
    key?: string;
}

/**
 * Build the sidebar navigation for the current user's permissions.
 * Server policies remain the source of truth — this only controls
 * which items are rendered.
 */
export function navigationFor(permissions: Permissions | null): NavItem[] {
    if (permissions === null) return [];

    return [
        { labelKey: 'nav.dashboard', route: 'dashboard', icon: 'grid', visible: true },
        { labelKey: 'nav.users', route: 'users.index', icon: 'users', visible: permissions.users },
        { labelKey: 'nav.suppliers', route: 'suppliers.index', icon: 'truck', visible: permissions.suppliers },
        { labelKey: 'nav.classifications', route: 'classifications.index', icon: 'tags', visible: permissions.classifications },
        { labelKey: 'nav.materials', route: 'materials.index', icon: 'layers', visible: permissions.materials },
        { labelKey: 'nav.customers', route: 'customers.index', icon: 'users2', visible: permissions.customers },
        { labelKey: 'nav.invoices', route: 'invoices.index', icon: 'receipt', visible: permissions.invoices },
        { labelKey: 'nav.payments', route: 'invoices.index', key: 'payments', icon: 'wallet', visible: permissions.payments },
        { labelKey: 'nav.taxes', route: 'taxes.index', icon: 'percent', visible: permissions.taxes },
        { labelKey: 'nav.currencies', route: 'currencies.index', icon: 'coins', visible: permissions.currencies },
        { labelKey: 'nav.exchange_rates', route: 'exchange-rates.index', icon: 'swap', visible: permissions.exchangeRates },
        { labelKey: 'nav.reports', route: 'reports.index', icon: 'chart', visible: permissions.reports },
        { labelKey: 'nav.audit_log', route: 'audit-logs.index', icon: 'scroll', visible: permissions.auditLogs },
        { labelKey: 'nav.gallery_admin', route: 'gallery.index', icon: 'image', visible: permissions.gallery },
        { labelKey: 'nav.integrations', route: 'integrations.index', icon: 'radar', visible: permissions.integrations },
        { labelKey: 'nav.settings', route: 'settings.edit', icon: 'cog', visible: permissions.settings },
        { labelKey: 'nav.site_content', route: 'site-content.index', icon: 'type', visible: permissions.settings },
        { labelKey: 'nav.public_profile', route: 'settings.profile.edit', icon: 'users2', visible: permissions.settings },
    ];
}
