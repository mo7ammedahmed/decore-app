import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import MoneyDisplay from '@/Components/MoneyDisplay';
import GlassButton from '@/Components/GlassButton';
import DateInput from '@/Components/DateInput';
import { invoiceStatusKey, paymentStatusKey, useI18n } from '@/Utilities/i18n';
import { Head, Link, router } from '@inertiajs/react';
import type { Invoice, Paginated } from '@/types/domain';
import { formatDate, invoiceTone, paymentTone } from '@/Utilities/format';

interface IndexProps {
    invoices: Paginated<Invoice>;
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
        customer?: string;
        from?: string;
        to?: string;
    };
    customers: { id: number; name: string }[];
    canManage: boolean;
}

export default function Index({ invoices, filters, customers, canManage }: IndexProps) {
    const { t } = useI18n();

    const updateFilter = (key: string, value: string) => {
        router.get(
            route('invoices.index'),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('invoices.title')} />

            <PageHeader title={t('invoices.title')} description={t('invoices.sub')}>
                {canManage && <GlassButton href={route('invoices.create')}>{t('invoices.new')}</GlassButton>}
            </PageHeader>

            <GlassCard className="p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                    <SearchInput filters={filters} placeholder={t('invoices.search_placeholder')} />
                    <select
                        className="form-select w-full sm:w-auto"
                        value={filters.status ?? ''}
                        onChange={(e) => updateFilter('status', e.target.value)}
                    >
                        <option value="" className="bg-neutral-900">{t('invoices.any_status')}</option>
                        {(['draft', 'issued', 'cancelled', 'completed'] as const).map((value) => (
                            <option key={value} value={value} className="bg-neutral-900">{t(invoiceStatusKey(value))}</option>
                        ))}
                    </select>
                    <select
                        className="form-select w-full sm:w-auto"
                        value={filters.payment_status ?? ''}
                        onChange={(e) => updateFilter('payment_status', e.target.value)}
                    >
                        <option value="" className="bg-neutral-900">{t('invoices.any_payment')}</option>
                        {(['unpaid', 'partial', 'paid', 'overpaid'] as const).map((value) => (
                            <option key={value} value={value} className="bg-neutral-900">{t(paymentStatusKey(value))}</option>
                        ))}
                    </select>
                    <select
                        className="form-select w-full sm:w-auto"
                        value={filters.customer ?? ''}
                        onChange={(e) => updateFilter('customer', e.target.value)}
                    >
                        <option value="" className="bg-neutral-900">{t('invoices.all_customers')}</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>
                        ))}
                    </select>
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        <DateInput
                            className="min-w-0 flex-1 sm:w-40 sm:flex-none"
                            value={filters.from ?? ''}
                            onChange={(e) => updateFilter('from', e.target.value)}
                            aria-label={t('invoices.from_date')}
                        />
                        <span className="shrink-0 text-white/30">→</span>
                        <DateInput
                            className="min-w-0 flex-1 sm:w-40 sm:flex-none"
                            value={filters.to ?? ''}
                            onChange={(e) => updateFilter('to', e.target.value)}
                            aria-label={t('invoices.to_date')}
                        />
                    </div>
                </div>

                {invoices.total === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            title={t('invoices.empty_title')}
                            description={t('invoices.empty_desc')}
                        />
                    </div>
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="table-glass w-full min-w-[760px]">
                            <thead>
                                <tr>
                                    <th>{t('common.number')}</th>
                                    <th>{t('invoices.col_customer')}</th>
                                    <th>{t('common.issue_date')}</th>
                                    <th>{t('common.status')}</th>
                                    <th>{t('invoices.col_payment')}</th>
                                    <th className="text-right">{t('common.total')}</th>
                                    <th className="text-right">{t('invoices.col_balance')}</th>
                                    <th className="text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.data.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>
                                            <Link href={route('invoices.show', invoice.id)} className="font-medium text-white transition-colors hover:text-accent">
                                                {invoice.invoice_number}
                                            </Link>
                                        </td>
                                        <td>{invoice.customer?.name ?? '—'}</td>
                                        <td>{formatDate(invoice.issue_date)}</td>
                                        <td>
                                            <StatusBadge label={t(invoiceStatusKey(invoice.status))} tone={invoiceTone(invoice.status)} />
                                        </td>
                                        <td>
                                            <StatusBadge label={t(paymentStatusKey(invoice.payment_status))} tone={paymentTone(invoice.payment_status)} />
                                        </td>
                                        <td className="text-right">
                                            <MoneyDisplay value={invoice.total} currency={invoice.currency_code} />
                                        </td>
                                        <td className="text-right">
                                            <MoneyDisplay
                                                value={invoice.balance_due}
                                                currency={invoice.base_currency_code}
                                                tone={Number(invoice.balance_due) > 0 ? 'default' : 'success'}
                                            />
                                        </td>
                                        <td className="text-right">
                                            <Link href={route('invoices.show', invoice.id)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                {t('common.view')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination paginator={invoices} />
            </GlassCard>
        </AuthenticatedLayout>
    );
}
