import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import EmptyState from '@/Components/EmptyState';
import MoneyDisplay from '@/Components/MoneyDisplay';
import StatusBadge from '@/Components/StatusBadge';
import { invoiceStatusKey, useI18n } from '@/Utilities/i18n';
import { Head, Link } from '@inertiajs/react';
import type { Customer, Invoice } from '@/types/domain';
import { formatDate, invoiceTone } from '@/Utilities/format';

interface ShowProps {
    customer: Customer & { invoices?: Invoice[] };
    canManage?: boolean;
    canCreateInvoice?: boolean;
}

export default function Show({ customer, canManage = false, canCreateInvoice = false }: ShowProps) {
    const { t } = useI18n();

    const details: [string, string][] = [
        [t('common.company'), customer.company_name ?? '—'],
        [t('common.email'), customer.email ?? '—'],
        [t('common.phone'), customer.phone ?? '—'],
        [t('common.tax_number'), customer.tax_number ?? '—'],
        [t('common.city'), customer.city ?? '—'],
        [t('common.address'), customer.address ?? '—'],
        [t('customers.created_by'), customer.creator?.name ?? '—'],
    ];

    return (
        <AuthenticatedLayout>
            <Head title={customer.name} />

            <PageHeader title={customer.name} description={customer.company_name ?? t('customers.entity')}>
                {canManage && <GlassButton href={route('customers.edit', customer.id)} variant="secondary">{t('customers.edit_customer')}</GlassButton>}
                {canCreateInvoice && <GlassButton href={route('invoices.create')}>{t('customers.new_invoice')}</GlassButton>}
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-6 lg:col-span-1">
                    <h2 className="font-heading text-xl italic text-white">{t('common.details')}</h2>
                    <dl className="mt-5 space-y-3.5 text-sm">
                        {details.map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between gap-4">
                                <dt className="text-white/40">{label}</dt>
                                <dd className="text-right text-white/80">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </GlassCard>

                <GlassCard className="p-6 lg:col-span-2">
                    <h2 className="font-heading text-xl italic text-white">{t('customers.invoices')}</h2>
                    {!customer.invoices || customer.invoices.length === 0 ? (
                        <EmptyState title={t('customers.no_invoices_title')} description={t('customers.no_invoices_desc')} />
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="table-glass w-full min-w-[520px]">
                                <thead>
                                    <tr>
                                        <th>{t('common.number')}</th>
                                        <th>{t('common.issue_date')}</th>
                                        <th>{t('common.total')}</th>
                                        <th>{t('common.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>
                                                <Link href={route('invoices.show', invoice.id)} className="font-medium text-accent hover:text-white">
                                                    {invoice.invoice_number}
                                                </Link>
                                            </td>
                                            <td>{formatDate(invoice.issue_date)}</td>
                                            <td>
                                                <MoneyDisplay value={invoice.total} currency={invoice.currency_code} />
                                            </td>
                                            <td>
                                                <StatusBadge label={t(invoiceStatusKey(invoice.status))} tone={invoiceTone(invoice.status)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            </div>
        </AuthenticatedLayout>
    );
}
