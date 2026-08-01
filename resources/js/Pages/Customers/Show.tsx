import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import EmptyState from '@/Components/EmptyState';
import MoneyDisplay from '@/Components/MoneyDisplay';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';
import type { Customer, Invoice } from '@/types/domain';
import { formatDate, INVOICE_STATUS_LABELS, invoiceTone } from '@/Utilities/format';

interface ShowProps {
    customer: Customer & { invoices?: Invoice[] };
    canManage?: boolean;
    canCreateInvoice?: boolean;
}

export default function Show({ customer, canManage = false, canCreateInvoice = false }: ShowProps) {
    const details: [string, string][] = [
        ['Company', customer.company_name ?? '—'],
        ['Email', customer.email ?? '—'],
        ['Phone', customer.phone ?? '—'],
        ['Tax number', customer.tax_number ?? '—'],
        ['City', customer.city ?? '—'],
        ['Address', customer.address ?? '—'],
        ['Created by', customer.creator?.name ?? '—'],
    ];

    return (
        <AuthenticatedLayout>
            <Head title={customer.name} />

            <PageHeader title={customer.name} description={customer.company_name ?? 'Customer'}>
                {canManage && <GlassButton href={route('customers.edit', customer.id)} variant="secondary">Edit customer</GlassButton>}
                {canCreateInvoice && <GlassButton href={route('invoices.create')}>New invoice</GlassButton>}
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-6 lg:col-span-1">
                    <h2 className="font-heading text-xl italic text-white">Details</h2>
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
                    <h2 className="font-heading text-xl italic text-white">Invoices</h2>
                    {!customer.invoices || customer.invoices.length === 0 ? (
                        <EmptyState title="No invoices yet" description="Create an invoice for this customer to get started." />
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="table-glass w-full min-w-[520px]">
                                <thead>
                                    <tr>
                                        <th>Number</th>
                                        <th>Issue date</th>
                                        <th>Total</th>
                                        <th>Status</th>
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
                                                <StatusBadge label={INVOICE_STATUS_LABELS[invoice.status]} tone={invoiceTone(invoice.status)} />
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
