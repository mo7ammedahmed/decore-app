import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import MoneyDisplay from '@/Components/MoneyDisplay';
import EmptyState from '@/Components/EmptyState';
import { paymentMethodKey, useI18n } from '@/Utilities/i18n';
import { Head, Link } from '@inertiajs/react';
import type { Invoice, Payment } from '@/types/domain';
import { formatDateTime } from '@/Utilities/format';

interface IndexProps {
    invoice: Invoice;
    payments: Payment[];
}

export default function Index({ invoice, payments }: IndexProps) {
    const { t } = useI18n();

    return (
        <AuthenticatedLayout>
            <Head title={t('payments.title', { number: invoice.invoice_number })} />

            <PageHeader
                title={invoice.invoice_number}
                description={t('payments.sub')}
            >
                <GlassButton href={route('invoices.show', invoice.id)} variant="secondary">{t('invoices.back_to_invoice')}</GlassButton>
                <GlassButton href={route('payments.create', invoice.id)}>{t('payments.record')}</GlassButton>
            </PageHeader>

            <GlassCard className="p-6">
                {payments.length === 0 ? (
                    <EmptyState title={t('payments.empty_title')} description={t('payments.empty_desc')} />
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white/90">
                                        {payment.payment_number}
                                        {payment.reversed_at && (
                                            <span className="ml-2 text-xs font-medium uppercase tracking-wider text-danger">{t('invoices.reversed')}</span>
                                        )}
                                    </p>
                                    <p className="mt-0.5 text-xs text-white/40">
                                        {t(paymentMethodKey(payment.payment_method))} ·{' '}
                                        {formatDateTime(payment.paid_at)} · {t('invoices.by', { name: payment.recorder?.name ?? '—' })}
                                    </p>
                                    {payment.reference && (
                                        <p className="mt-0.5 text-xs text-white/35">{t('invoices.ref', { reference: payment.reference })}</p>
                                    )}
                                    {payment.notes && (
                                        <p className="mt-0.5 text-xs text-white/35">{payment.notes}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className={`tabular-nums text-sm ${payment.reversed_at ? 'text-white/35 line-through' : 'text-success'}`}>
                                        <MoneyDisplay value={payment.amount} currency={payment.currency_code} />
                                    </p>
                                    {payment.currency_code !== invoice.base_currency_code && !payment.reversed_at && (
                                        <p className="mt-0.5 text-xs text-white/35">
                                            {t('payments.base')} <MoneyDisplay value={payment.base_amount} currency={invoice.base_currency_code} />
                                        </p>
                                    )}
                                    {payment.reversed_at && (
                                        <p className="mt-0.5 text-xs text-danger/70">{t('payments.reversed_at', { date: formatDateTime(payment.reversed_at) })}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-5 text-sm">
                    <span className="text-white/50">
                        {t('payments.balance_due')} <MoneyDisplay value={invoice.balance_due} currency={invoice.base_currency_code} tone={Number(invoice.balance_due) > 0 ? 'default' : 'success'} />
                    </span>
                    <Link href={route('invoices.show', invoice.id)} className="text-accent transition-colors hover:text-white">
                        {t('payments.view_full_invoice')}
                    </Link>
                </div>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
