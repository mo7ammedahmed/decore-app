import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import MetricCard from '@/Components/MetricCard';
import StatusBadge from '@/Components/StatusBadge';
import MoneyDisplay from '@/Components/MoneyDisplay';
import GlassCard from '@/Components/GlassCard';
import EmptyState from '@/Components/EmptyState';
import MiniBarChart from '@/Components/MiniBarChart';
import TrafficChart from '@/Components/TrafficChart';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { DashboardMetrics } from '@/types/domain';
import { formatDate, money, INVOICE_STATUS_LABELS, invoiceTone } from '@/Utilities/format';

interface DashboardProps {
    metrics: DashboardMetrics;
    period: string;
    periodBounds: { from: string; to: string };
    baseCurrency: string;
}

export default function Dashboard({ metrics, period, periodBounds, baseCurrency }: DashboardProps) {
    const { t } = useI18n();

    const PERIODS = [
        { value: 'today', label: t('dash.today') },
        { value: 'week', label: t('dash.week') },
        { value: 'month', label: t('dash.month') },
        { value: 'year', label: t('dash.year') },
        { value: 'custom', label: t('dash.custom') },
    ];

    // DashboardService returns different key sets per role — gate each block
    // on a key only that role provides.
    const isAdmin = metrics.counts?.suppliers !== undefined;
    const isFinancialRole = metrics.financial?.revenue !== undefined; // admin + accountant
    const isSales = metrics.financial?.personal_sales_total !== undefined;
    const isSupplier = metrics.counts?.active_materials !== undefined;

    const financial = metrics.financial;
    const counts = metrics.counts;

    const changePeriod = (value: string) => {
        router.get(route('dashboard'), { period: value || undefined }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('dash.title')} />

            <PageHeader title={t('dash.title')} description={t('dash.overview', { from: periodBounds.from, to: periodBounds.to })}>
                <label className="flex items-center gap-2 text-sm text-white/50">
                    {t('common.period')}
                    <select
                        className="form-select w-40"
                        value={period}
                        onChange={(e) => changePeriod(e.target.value)}
                    >
                        {PERIODS.map((p) => (
                            <option key={p.value} value={p.value} className="bg-neutral-900">
                                {p.label}
                            </option>
                        ))}
                    </select>
                </label>
            </PageHeader>

            {/* Admin: master counts */}
            {isAdmin && counts && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
                >
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.suppliers')} value={String(counts.suppliers)} icon="M8 16a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2zm9 0a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2zM2 5h11v9H2V5zm11 4h4l3 3v2h-7V9z" /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.materials')} value={String(counts.materials)} icon="M4 5l8-3 8 3-8 3-8-3zm0 5l8 3 8-3M4 15l8 3 8-3" /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.customers')} value={String(counts.customers)} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.invoices')} value={String(counts.invoices)} icon="M9 14l6 0M9 17h6M7 3h10a1 1 0 011 1v17l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V4a1 1 0 011-1z" /></motion.div>
                </motion.div>
            )}

            {/* Admin + accountant: financial metrics */}
            {isFinancialRole && financial && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6"
                >
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.revenue')} value={money(financial.revenue, baseCurrency)} tone="accent" /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.payments_received')} value={money(financial.payments_received, baseCurrency)} tone="success" /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.outstanding')} value={money(financial.outstanding_balance, baseCurrency)} tone="danger" /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.supplier_costs')} value={money(financial.costs, baseCurrency)} /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.gross_profit')} value={money(financial.gross_profit, baseCurrency)} tone="success" /></motion.div>
                    <motion.div variants={staggerItem}><MetricCard label={t('dash.margin')} value={`${financial.margin}%`} tone="info" /></motion.div>
                </motion.div>
            )}

            {isFinancialRole && financial && (financial.overdue_count > 0 || financial.due_soon_count > 0) && (
                <div className="mt-6 flex flex-wrap gap-3">
                    {financial.overdue_count > 0 && (
                        <span className="liquid-glass rounded-full px-4 py-2 text-sm text-danger">
                            {t('dash.overdue_count', { count: financial.overdue_count })}
                        </span>
                    )}
                    {financial.due_soon_count > 0 && (
                        <span className="liquid-glass rounded-full px-4 py-2 text-sm text-warning">
                            {t('dash.due_soon', { count: financial.due_soon_count })}
                        </span>
                    )}
                </div>
            )}

            {/* Sales: personal summary */}
            {isSales && financial && (
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <MetricCard label={t('dash.draft_invoices')} value={String(counts?.draft_invoices ?? 0)} tone="info" />
                    <MetricCard label={t('dash.issued_invoices')} value={String(counts?.issued_invoices ?? 0)} />
                    <MetricCard label={t('dash.personal_sales')} value={money(financial.personal_sales_total, baseCurrency)} tone="accent" />
                    <MetricCard label={t('dash.follow_ups')} value={String(financial.outstanding_follow_ups ?? metrics.follow_ups?.length ?? 0)} tone="danger" />
                </div>
            )}

            {/* Supplier: own materials summary */}
            {isSupplier && counts && (
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <MetricCard label={t('dash.my_materials')} value={String(counts.materials)} />
                    <MetricCard label={t('dash.active_materials')} value={String(counts.active_materials ?? 0)} tone="success" />
                    <MetricCard label={t('dash.missing_images')} value={String(counts.missing_images ?? 0)} tone="danger" />
                </div>
            )}

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
                {/* Revenue by month */}
                {metrics.revenue_by_month && metrics.revenue_by_month.length > 0 && (
                    <GlassCard className="p-6 xl:col-span-2">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.revenue_by_month')}</h2>
                        <MiniBarChart
                            title={t('dash.revenue_by_month')}
                            data={metrics.revenue_by_month.map((row) => ({ label: row.month, value: Number(row.revenue) || 0 }))}
                            format={(value) => money(value, baseCurrency)}
                        />
                    </GlassCard>
                )}

                {/* Revenue by classification / supplier */}
                {metrics.revenue_by_classification && metrics.revenue_by_classification.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.by_classification')}</h2>
                        <ul className="mt-5 space-y-3">
                            {metrics.revenue_by_classification.map((row) => (
                                <li key={row.name} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="truncate text-white/65">{row.name}</span>
                                    <MoneyDisplay value={row.revenue} currency={baseCurrency} />
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                )}

                {metrics.revenue_by_supplier && metrics.revenue_by_supplier.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.by_supplier')}</h2>
                        <ul className="mt-5 space-y-3">
                            {metrics.revenue_by_supplier.map((row) => (
                                <li key={row.name} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="truncate text-white/65">{row.name}</span>
                                    <MoneyDisplay value={row.revenue} currency={baseCurrency} />
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                )}

                {/* Payments by month */}
                {metrics.payments_by_month && metrics.payments_by_month.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.payments_by_month')}</h2>
                        <MiniBarChart
                            title={t('dash.payments_by_month')}
                            tone="success"
                            data={metrics.payments_by_month.map((row) => ({ label: row.month, value: Number(row.payments) || 0 }))}
                            format={(value) => money(value, baseCurrency)}
                        />
                    </GlassCard>
                )}
            </div>

            {/* Admin: visitor analytics */}
            {isAdmin && metrics.analytics && (
                <GlassCard className="mt-6 p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="font-heading text-2xl italic text-white">{t('dash.visitor_analytics')}</h2>
                            <p className="mt-1 text-sm text-white/40">{t('dash.visitor_analytics_sub')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="liquid-glass rounded-full px-4 py-1.5 text-sm">
                                <span className="text-white/45">{t('dash.visitors')}: </span>
                                <span className="font-medium tabular-nums text-white">{metrics.analytics.summary.visitors}</span>
                            </span>
                            <span className="liquid-glass rounded-full px-4 py-1.5 text-sm">
                                <span className="text-white/45">{t('dash.sessions')}: </span>
                                <span className="font-medium tabular-nums text-white">{metrics.analytics.summary.sessions}</span>
                            </span>
                            <span className="liquid-glass rounded-full px-4 py-1.5 text-sm">
                                <span className="text-white/45">{t('dash.page_views')}: </span>
                                <span className="font-medium tabular-nums text-white">{metrics.analytics.summary.page_views}</span>
                            </span>
                        </div>
                    </div>

                    {metrics.analytics.summary.page_views === 0 ? (
                        <div className="mt-4">
                            <EmptyState title={t('dash.no_analytics')} description={t('dash.no_analytics_desc')} icon="chart" />
                        </div>
                    ) : (
                        <TrafficChart
                            title={t('dash.visitor_analytics')}
                            data={metrics.analytics.series.map((point) => ({ label: point.label, page_views: point.page_views }))}
                        />
                    )}
                </GlassCard>
            )}

            {/* Recent invoices */}
            {metrics.recent_invoices && metrics.recent_invoices.length > 0 && (
                <GlassCard className="mt-6 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.recent_invoices')}</h2>
                        <Link href={route('invoices.index')} className="text-sm text-accent transition-colors hover:text-white">
                            {t('common.view_all')}
                        </Link>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <table className="table-glass w-full min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>{t('dash.number')}</th>
                                    <th>{t('dash.customer')}</th>
                                    <th>{t('dash.issue_date')}</th>
                                    <th>{t('dash.total')}</th>
                                    <th>{t('dash.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.recent_invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>
                                            <Link href={route('invoices.show', invoice.id)} className="font-medium text-accent hover:text-white">
                                                {invoice.invoice_number}
                                            </Link>
                                        </td>
                                        <td>{invoice.customer?.name ?? '—'}</td>
                                        <td>{formatDate(invoice.issue_date)}</td>
                                        <td><MoneyDisplay value={invoice.total} currency={invoice.currency_code} /></td>
                                        <td>
                                            <StatusBadge label={INVOICE_STATUS_LABELS[invoice.status]} tone={invoiceTone(invoice.status)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                {/* Recent payments */}
                {metrics.recent_payments && metrics.recent_payments.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.recent_payments')}</h2>
                        <ul className="mt-4 space-y-3">
                            {metrics.recent_payments.map((payment) => (
                                <li key={payment.id} className="flex items-center justify-between gap-3 text-sm">
                                    <div>
                                        <p className="text-white/80">{payment.payment_number}</p>
                                        <p className="text-xs text-white/35">
                                            {payment.invoice?.invoice_number} · {payment.recorder?.name}
                                        </p>
                                    </div>
                                    <MoneyDisplay value={payment.amount} currency={payment.currency_code} tone="success" />
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                )}

                {/* Low stock */}
                {metrics.low_stock && metrics.low_stock.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.low_stock')}</h2>
                        <ul className="mt-4 space-y-3">
                            {metrics.low_stock.map((material) => (
                                <li key={material.id} className="flex items-center justify-between gap-3 text-sm">
                                    <div>
                                        <Link href={route('materials.show', material.id)} className="text-white/80 hover:text-white">
                                            {material.localized_name ?? material.name_en}
                                        </Link>
                                        <p className="text-xs text-white/35">{material.supplier?.name}</p>
                                    </div>
                                    <StatusBadge label={`${material.stock_quantity} / ${material.minimum_stock_level}`} tone="bg-danger/15 text-danger" dot={false} />
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                )}

                {/* Top selling */}
                {metrics.top_selling && metrics.top_selling.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.top_selling')}</h2>
                        <ul className="mt-4 space-y-3">
                            {metrics.top_selling.map((row) => (
                                <li key={row.material_id} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="truncate text-white/70">{row.name}</span>
                                    <span className="flex items-center gap-3">
                                        <span className="text-xs text-white/35">{t('dash.sold', { qty: row.total_qty })}</span>
                                        <MoneyDisplay value={row.revenue} currency={baseCurrency} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                )}

                {/* Overdue invoices */}
                {metrics.overdue_invoices && metrics.overdue_invoices.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.overdue')}</h2>
                        <ul className="mt-4 space-y-3">
                            {metrics.overdue_invoices.map((invoice) => (
                                <li key={invoice.id} className="flex items-center justify-between gap-3 text-sm">
                                    <div>
                                        <Link href={route('invoices.show', invoice.id)} className="text-danger hover:text-white">
                                            {invoice.invoice_number}
                                        </Link>
                                        <p className="text-xs text-white/35">{invoice.customer?.name} · {t('dash.due', { date: formatDate(invoice.due_date) })}</p>
                                    </div>
                                    <MoneyDisplay value={invoice.balance_due} currency={invoice.currency_code} tone="danger" />
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                )}
            </div>

            {/* Supplier: recently updated materials + missing images */}
            {metrics.recent_materials && (
                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.recently_updated')}</h2>
                        {metrics.recent_materials.length === 0 ? (
                            <EmptyState title={t('dash.no_materials_yet')} description={t('dash.create_first_material')} />
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {metrics.recent_materials.map((material) => (
                                    <li key={material.id} className="flex items-center justify-between gap-3 text-sm">
                                        <Link href={route('materials.show', material.id)} className="text-white/80 hover:text-white">
                                            {material.localized_name ?? material.name_en}
                                        </Link>
                                        <span className="text-xs text-white/35">{material.classification?.localized_name ?? material.classification?.name_en}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>

                    {metrics.missing_images !== undefined && metrics.missing_images > 0 && (
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-2xl italic text-white">{t('dash.action_needed')}</h2>
                            <p className="mt-3 text-sm text-white/55">
                                {t('dash.missing_images_note', { count: metrics.missing_images })}
                            </p>
                        </GlassCard>
                    )}
                </div>
            )}

            {/* Sales: recent customers, popular materials, follow-ups */}
            {metrics.recent_customers && (
                <div className="mt-6 grid gap-6 xl:grid-cols-3">
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-2xl italic text-white">{t('dash.recent_customers')}</h2>
                        <ul className="mt-4 space-y-3">
                            {metrics.recent_customers.map((customer) => (
                                <li key={customer.id} className="flex items-center justify-between gap-3 text-sm">
                                    <div>
                                        <p className="text-white/80">{customer.name}</p>
                                        <p className="text-xs text-white/35">{customer.city ?? '—'}</p>
                                    </div>
                                    <span className="text-xs text-white/35">{customer.company_name ?? t('dash.individual')}</span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {metrics.popular_materials && metrics.popular_materials.length > 0 && (
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-2xl italic text-white">{t('dash.popular_materials')}</h2>
                            <ul className="mt-4 space-y-3">
                                {metrics.popular_materials.map((row, index) => (
                                    <li key={index} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="truncate text-white/70">{row.description}</span>
                                        <span className="text-xs text-white/40">{t('dash.sold', { qty: row.total_qty })}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    )}

                    {metrics.follow_ups && metrics.follow_ups.length > 0 && (
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-2xl italic text-white">{t('dash.outstanding_follow_ups')}</h2>
                            <ul className="mt-4 space-y-3">
                                {metrics.follow_ups.map((invoice) => (
                                    <li key={invoice.id} className="flex items-center justify-between gap-3 text-sm">
                                        <div>
                                            <Link href={route('invoices.show', invoice.id)} className="text-white/80 hover:text-white">
                                                {invoice.invoice_number}
                                            </Link>
                                            <p className="text-xs text-white/35">
                                                {invoice.customer?.name}
                                                {invoice.customer && 'phone' in invoice.customer && invoice.customer.phone
                                                    ? ` · ${invoice.customer.phone}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <MoneyDisplay value={invoice.balance_due} currency={invoice.currency_code} />
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    )}
                </div>
            )}

            {/* Quick Management Dropdown */}
            <GlassCard className="mt-6 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl italic text-white">{t('dash.quick_management')}</h2>
                    <div className="flex items-center gap-2 text-sm text-white/50">
                        {t('dash.manage_website_elements')}
                        <select
                            className="form-select w-36 ml-2"
                            onChange={(e) => {
                                const path = e.target.value;
                                if (path) router.visit(path);
                            }}
                        >
                            <option value="" disabled selected>{t('dash.select_action')}</option>
                            <option value={route('site-content.index')}>{t('dash.site_content')}</option>
                            <option value={route('integrations.index')}>{t('dash.integrations')}</option>
                            <option value={route('settings.index')}>{t('dash.shop_settings')}</option>
                            <option value={route('users.index')}>{t('dash.user_management')}</option>
                            <option value={route('materials.index')}>{t('dash.materials_management')}</option>
                        </select>
                    </div>
                </div>
                <p className="mt-2 text-xs text-white/40">
                    {t('dash.quick_management_desc')}
                </p>
            </GlassCard>

            {!isAdmin && !isFinancialRole && !isSales && !isSupplier && (
                <GlassCard className="p-10">
                    <EmptyState title={t('dash.nothing_to_show')} description={t('dash.no_data_yet')} />
                </GlassCard>
            )}
        </AuthenticatedLayout>
    );
}
