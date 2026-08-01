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
            <Head title={`Record payment — ${invoice.invoice_number}`} />

            <PageHeader title="Record payment" description={invoice.invoice_number}>
                <GlassButton href={route('invoices.show', invoice.id)} variant="secondary">Back to invoice</GlassButton>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-8 lg:col-span-2">
                    <form onSubmit={submit} className="space-y-5">
                        <FormField
                            label="Amount"
                            required
                            error={errors.amount}
                            htmlFor="amount"
                            hint={`Balance due: ${money(balanceDue, currency)}`}
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
                            <FormField label="Payment method" required error={errors.payment_method} htmlFor="payment_method">
                                <SelectInput
                                    id="payment_method"
                                    options={paymentMethods.map((m) => ({ value: m, label: methodLabel(m) }))}
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value as PaymentMethod)}
                                />
                            </FormField>
                            <FormField label="Paid at" required error={errors.paid_at} htmlFor="paid_at">
                                <DateInput
                                    id="paid_at"
                                    value={data.paid_at}
                                    onChange={(e) => setData('paid_at', e.target.value)}
                                />
                            </FormField>
                            <FormField label="Reference" error={errors.reference} htmlFor="reference" hint="Bank transfer ref, cheque number, card last 4…">
                                <TextInput id="reference" value={data.reference} onChange={(e) => setData('reference', e.target.value)} />
                            </FormField>
                        </div>

                        <FormField label="Notes" error={errors.notes} htmlFor="notes">
                            <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        </FormField>

                        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-5">
                            <GlassButton href={route('invoices.show', invoice.id)} variant="secondary">Cancel</GlassButton>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Recording…' : 'Record payment'}
                            </PrimaryButton>
                        </div>
                    </form>
                </GlassCard>

                <GlassCard className="h-fit p-6">
                    <h2 className="font-heading text-xl italic text-white">Invoice</h2>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-white/40">Customer</dt>
                            <dd className="text-right text-white/80">{invoice.customer?.name ?? '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-white/40">Total</dt>
                            <dd className="text-right text-white/80">
                                <MoneyDisplay value={invoice.total} currency={currency} />
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-white/40">Paid</dt>
                            <dd className="text-right text-success">
                                <MoneyDisplay value={invoice.paid_total} currency={currency} />
                            </dd>
                        </div>
                        <div className="flex justify-between border-t border-white/[0.08] pt-3">
                            <dt className="font-medium text-white/60">Balance due</dt>
                            <dd className="text-right font-heading text-lg italic text-accent">
                                <MoneyDisplay value={balanceDue} currency={currency} />
                            </dd>
                        </div>
                    </dl>
                    <p className="mt-5 text-xs leading-relaxed text-white/40">
                        Payments are recorded in the invoice currency. The base-currency equivalent is calculated with the
                        invoice exchange rate and cannot be altered later.
                    </p>
                </GlassCard>
            </div>
        </AuthenticatedLayout>
    );
}

function methodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
        cash: 'Cash',
        bank_transfer: 'Bank transfer',
        card: 'Card',
        cheque: 'Cheque',
        other: 'Other',
    };
    return labels[method];
}
