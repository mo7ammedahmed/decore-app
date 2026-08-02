import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import DateInput from '@/Components/DateInput';
import CurrencyInput from '@/Components/CurrencyInput';
import PrimaryButton from '@/Components/PrimaryButton';
import MoneyDisplay from '@/Components/MoneyDisplay';
import { paymentMethodKey, useI18n } from '@/Utilities/i18n';
import { Head, useForm } from '@inertiajs/react';
import type { Invoice, PaymentMethod } from '@/types/domain';
import { money } from '@/Utilities/format';

interface CreateProps {
    invoice: Invoice;
    paymentMethods: PaymentMethod[];
    balanceDue: string;
    currency: string;
}

export default function Create({ invoice, paymentMethods, balanceDue, currency }: CreateProps) {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        amount: Number(balanceDue) > 0 ? balanceDue : '',
        payment_method: 'cash' as PaymentMethod,
        paid_at: new Date().toISOString().slice(0, 10),
        reference: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payments.store', invoice.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('payments.create_title', { number: invoice.invoice_number })} />

            <PageHeader title={t('payments.record')} description={invoice.invoice_number}>
                <GlassButton href={route('invoices.show', invoice.id)} variant="secondary">{t('invoices.back_to_invoice')}</GlassButton>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-8 lg:col-span-2">
                    <form onSubmit={submit} className="space-y-5">
                        <FormField
                            label={t('payments.amount')}
                            required
                            error={errors.amount}
                            htmlFor="amount"
                            hint={t('payments.balance_due_hint', { amount: money(balanceDue, currency) })}
                        >
                            <CurrencyInput
                                id="amount"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                currency={currency}
                                required
                            />
                        </FormField>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField label={t('payments.method')} required error={errors.payment_method} htmlFor="payment_method">
                                <SelectInput
                                    id="payment_method"
                                    options={paymentMethods.map((m) => ({ value: m, label: t(paymentMethodKey(m)) }))}
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value as PaymentMethod)}
                                />
                            </FormField>
                            <FormField label={t('payments.paid_at')} required error={errors.paid_at} htmlFor="paid_at">
                                <DateInput
                                    id="paid_at"
                                    value={data.paid_at}
                                    onChange={(e) => setData('paid_at', e.target.value)}
                                />
                            </FormField>
                            <FormField label={t('payments.reference')} error={errors.reference} htmlFor="reference" hint={t('payments.reference_hint')}>
                                <TextInput id="reference" value={data.reference} onChange={(e) => setData('reference', e.target.value)} />
                            </FormField>
                        </div>

                        <FormField label={t('common.notes')} error={errors.notes} htmlFor="notes">
                            <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        </FormField>

                        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-5">
                            <GlassButton href={route('invoices.show', invoice.id)} variant="secondary">{t('common.cancel')}</GlassButton>
                            <PrimaryButton disabled={processing}>
                                {processing ? t('payments.recording') : t('payments.record')}
                            </PrimaryButton>
                        </div>
                    </form>
                </GlassCard>

                <GlassCard className="h-fit p-6">
                    <h2 className="font-heading text-xl italic text-white">{t('payments.invoice')}</h2>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-white/40">{t('invoices.customer')}</dt>
                            <dd className="text-right text-white/80">{invoice.customer?.name ?? '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-white/40">{t('common.total')}</dt>
                            <dd className="text-right text-white/80">
                                <MoneyDisplay value={invoice.total} currency={currency} />
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-white/40">{t('payments.paid')}</dt>
                            <dd className="text-right text-success">
                                <MoneyDisplay value={invoice.paid_total} currency={currency} />
                            </dd>
                        </div>
                        <div className="flex justify-between border-t border-white/[0.08] pt-3">
                            <dt className="font-medium text-white/60">{t('payments.balance_due_label')}</dt>
                            <dd className="text-right font-heading text-lg italic text-accent">
                                <MoneyDisplay value={balanceDue} currency={currency} />
                            </dd>
                        </div>
                    </dl>
                    <p className="mt-5 text-xs leading-relaxed text-white/40">
                        {t('payments.exchange_hint')}
                    </p>
                </GlassCard>
            </div>
        </AuthenticatedLayout>
    );
}
