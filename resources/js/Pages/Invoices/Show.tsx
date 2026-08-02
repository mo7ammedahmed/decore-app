import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import MoneyDisplay from '@/Components/MoneyDisplay';
import PaymentProgress from '@/Components/PaymentProgress';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { invoiceStatusKey, paymentMethodKey, paymentStatusKey, useI18n } from '@/Utilities/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { Invoice, Payment } from '@/types/domain';
import {
    formatDate,
    formatDateTime,
    invoiceTone,
    paymentTone,
} from '@/Utilities/format';

interface ShowProps {
    invoice: Invoice & { payments?: Payment[]; items: NonNullable<Invoice['items']> };
    canEdit: boolean;
    canManage: boolean;
    canRecordPayment: boolean;
    baseCurrency: string;
}

export default function Show({ invoice, canEdit, canManage, canRecordPayment, baseCurrency }: ShowProps) {
    const { t } = useI18n();
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const [confirmingReverse, setConfirmingReverse] = useState<Payment | null>(null);
    const issueForm = useForm({});
    const completeForm = useForm({});
    const cancelForm = useForm({});
    const reverseForm = useForm({});

    const currency = invoice.currency_code;
    const payments = invoice.payments ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={t('invoices.show_title', { number: invoice.invoice_number })} />

            <PageHeader
                title={invoice.invoice_number}
                description={t('invoices.show_sub', {
                    date: formatDate(invoice.issue_date),
                    customer: invoice.customer?.name ?? t('invoices.unknown_customer'),
                })}
            >
                <GlassButton href={route('invoices.print', invoice.id)} variant="secondary">{t('invoices.print')}</GlassButton>
                {canEdit && <GlassButton href={route('invoices.edit', invoice.id)} variant="secondary">{t('common.edit')}</GlassButton>}
                {canRecordPayment && (
                    <GlassButton href={route('payments.create', invoice.id)}>{t('invoices.record_payment')}</GlassButton>
                )}
                {canManage && invoice.status === 'draft' && (
                    <GlassButton
                        onClick={() => issueForm.post(route('invoices.issue', invoice.id))}
                        disabled={issueForm.processing}
                        as="button"
                    >
                        {issueForm.processing ? t('invoices.issuing') : t('invoices.issue')}
                    </GlassButton>
                )}
                {canManage && invoice.status === 'issued' && (
                    <GlassButton
                        onClick={() => completeForm.post(route('invoices.complete', invoice.id))}
                        disabled={completeForm.processing}
                        as="button"
                    >
                        {completeForm.processing ? t('invoices.completing') : t('invoices.mark_completed')}
                    </GlassButton>
                )}
                {canManage && ['draft', 'issued'].includes(invoice.status) && (
                    <GlassButton onClick={() => setConfirmingCancel(true)} variant="danger" as="button">
                        {t('common.cancel')}
                    </GlassButton>
                )}
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <GlassCard className="p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <StatusBadge label={t(invoiceStatusKey(invoice.status))} tone={invoiceTone(invoice.status)} />
                            <StatusBadge label={t(paymentStatusKey(invoice.payment_status))} tone={paymentTone(invoice.payment_status)} />
                            <span className="ml-auto text-xs text-white/40">
                                {invoice.base_currency_code !== invoice.currency_code
                                    ? t('invoices.rate_note', {
                                          rate: invoice.exchange_rate,
                                          code: invoice.currency_code,
                                          base: invoice.base_currency_code,
                                      })
                                    : t('invoices.billed_in', { code: invoice.currency_code })}
                            </span>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="table-glass w-full min-w-[640px]">
                                <thead>
                                    <tr>
                                        <th>{t('invoices.col_item')}</th>
                                        <th>{t('invoices.col_qty')}</th>
                                        <th className="text-right">{t('invoices.col_unit_price')}</th>
                                        <th className="text-right">{t('invoices.col_discount')}</th>
                                        <th className="text-right">{t('invoices.col_tax')}</th>
                                        <th className="text-right">{t('common.total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                        <p className="text-white/85">{item.description}</p>
                                            </td>
                                            <td>{Number(item.quantity)} {item.unit.replace('_', ' ')}</td>
                                            <td className="text-right">
                                                <MoneyDisplay value={item.unit_price} currency={currency} />
                                            </td>
                                            <td className="text-right">
                                                {Number(item.discount_amount) > 0 ? (
                                                    <MoneyDisplay value={item.discount_amount} currency={currency} tone="danger" />
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="text-right">
                                                {Number(item.tax_amount) > 0 ? (
                                                    <span className="tabular-nums text-white/70">
                                                        {Number(item.tax_rate)}% ·{' '}
                                                        <MoneyDisplay value={item.tax_amount} currency={currency} />
                                                    </span>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <MoneyDisplay value={item.line_total} currency={currency} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <dl className="mt-6 ml-auto max-w-xs space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-white/50">{t('invoices.subtotal')}</dt>
                                <dd className="tabular-nums text-white/85">
                                    <MoneyDisplay value={invoice.subtotal} currency={currency} />
                                </dd>
                            </div>
                            {Number(invoice.discount_total) > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-white/50">{t('invoices.col_discount')}</dt>
                                    <dd className="tabular-nums text-danger">
                                        − <MoneyDisplay value={invoice.discount_total} currency={currency} />
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-white/50">{t('invoices.col_tax')}</dt>
                                <dd className="tabular-nums text-white/85">
                                    <MoneyDisplay value={invoice.tax_total} currency={currency} />
                                </dd>
                            </div>
                            <div className="flex justify-between border-t border-white/[0.08] pt-3">
                                <dt className="font-heading text-lg italic text-white">{t('common.total')}</dt>
                                <dd className="font-heading text-lg italic tabular-nums text-accent">
                                    <MoneyDisplay value={invoice.total} currency={currency} />
                                </dd>
                            </div>
                        </dl>

                        {invoice.notes && (
                            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">{t('common.notes')}</p>
                                <p className="mt-1 text-sm text-white/70">{invoice.notes}</p>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h2 className="font-heading text-xl italic text-white">{t('invoices.payment_history')}</h2>
                        {payments.length === 0 ? (
                            <p className="mt-4 text-sm text-white/40">{t('invoices.no_payments')}</p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm text-white/85">
                                                {payment.payment_number}
                                                {payment.reversed_at && (
                                                    <span className="ml-2 text-xs font-medium uppercase tracking-wider text-danger">
                                                        {t('invoices.reversed')}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-xs text-white/40">
                                                {t(paymentMethodKey(payment.payment_method))} ·{' '}
                                                {formatDateTime(payment.paid_at)} · {t('invoices.by', { name: payment.recorder?.name ?? '—' })}
                                            </p>
                                            {payment.reference && (
                                                <p className="mt-0.5 text-xs text-white/35">{t('invoices.ref', { reference: payment.reference })}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={`tabular-nums text-sm ${payment.reversed_at ? 'text-white/35 line-through' : 'text-success'}`}
                                            >
                                                <MoneyDisplay value={payment.amount} currency={payment.currency_code} />
                                            </span>
                                            {!payment.reversed_at && canManage && (
                                                <button
                                                    onClick={() => setConfirmingReverse(payment)}
                                                    className="text-xs font-medium text-white/40 transition-colors hover:text-danger"
                                                >
                                                    {t('invoices.reverse')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-xl italic text-white">{t('invoices.payment_progress')}</h2>
                        <div className="mt-4">
                            <PaymentProgress invoice={invoice} currency={baseCurrency} />
                        </div>
                        {canRecordPayment && (
                            <Link
                                href={route('payments.create', invoice.id)}
                                className="mt-5 block w-full rounded-full bg-accent/15 py-2.5 text-center text-sm font-medium text-accent transition-colors hover:bg-accent/25"
                            >
                                {t('invoices.record_payment_link')}
                            </Link>
                        )}
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h2 className="font-heading text-xl italic text-white">{t('common.details')}</h2>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-white/40">{t('invoices.customer')}</dt>
                                <dd className="text-right text-white/80">{invoice.customer?.name ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-white/40">{t('invoices.created_by')}</dt>
                                <dd className="text-right text-white/80">{invoice.creator?.name ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-white/40">{t('common.due_date')}</dt>
                                <dd className="text-right text-white/80">{formatDate(invoice.due_date)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-white/40">{t('invoices.base_total')}</dt>
                                <dd className="text-right text-white/80">
                                    <MoneyDisplay value={invoice.base_total} currency={invoice.base_currency_code} />
                                </dd>
                            </div>
                        </dl>
                    </GlassCard>
                </div>
            </div>

            <ConfirmDialog
                open={confirmingCancel}
                onClose={() => setConfirmingCancel(false)}
                onConfirm={() => cancelForm.post(route('invoices.cancel', invoice.id))}
                title={t('invoices.cancel_confirm_title')}
                message={t('invoices.cancel_confirm_message')}
                confirmLabel={t('invoices.cancel_confirm_label')}
                processing={cancelForm.processing}
            />

            <ConfirmDialog
                open={confirmingReverse !== null}
                onClose={() => setConfirmingReverse(null)}
                onConfirm={() =>
                    confirmingReverse &&
                    reverseForm.post(route('payments.reverse', confirmingReverse.id))
                }
                title={t('invoices.reverse_confirm_title')}
                message={t('invoices.reverse_confirm_message')}
                confirmLabel={t('invoices.reverse_confirm_label')}
                processing={reverseForm.processing}
            />
        </AuthenticatedLayout>
    );
}
