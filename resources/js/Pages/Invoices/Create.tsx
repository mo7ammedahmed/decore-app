import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import SelectInput from '@/Components/SelectInput';
import DateInput from '@/Components/DateInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import InvoiceItemsEditor, { computeItemTotals } from '@/Components/InvoiceItemsEditor';
import InvoiceSummary from '@/Components/InvoiceSummary';
import InlineCustomerFields, { blankCustomer, type NewCustomer } from '@/Components/InlineCustomerFields';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { DiscountType, Material } from '@/types/domain';

interface CreateProps {
    customers: { id: number; name: string }[];
    currencies: { code: string; name: string; symbol: string | null; is_base: boolean }[];
    materials: Material[];
    taxRates: { id: number; name: string; rate: string; is_default: boolean }[];
    permissions: { manageCosts: boolean } | null;
    canCreateCustomer: boolean;
}

export default function Create({ customers, currencies, materials, taxRates, permissions, canCreateCustomer }: CreateProps) {
    const canManageCosts = permissions?.manageCosts ?? false;
    const [addingCustomer, setAddingCustomer] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        customer: null as NewCustomer | null,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        currency_code: currencies.find((c) => c.is_base)?.code ?? currencies[0]?.code ?? 'SAR',
        discount_type: 'none' as DiscountType,
        discount_value: '0',
        notes: '',
        items: [
            {
                material_id: materials[0] ? String(materials[0].id) : '',
                quantity: '1',
                unit_price: materials[0] ? materials[0].selling_price : '',
                unit_cost: '',
                discount_amount: '0',
                tax_rate: String(taxRates.find((t) => t.is_default)?.rate ?? 0),
                description: materials[0]?.localized_name ?? materials[0]?.name_en ?? '',
            },
        ],
    });

    const totals = computeItemTotals(data.items);
    const selectedCurrency = currencies.find((c) => c.code === data.currency_code);

    const setCustomerField = (field: keyof NewCustomer, value: string) => {
        setData('customer', { ...(data.customer ?? blankCustomer), [field]: value });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('invoices.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New invoice" />

            <PageHeader title="New invoice" description="Totals are previewed live; the server recalculates and is authoritative." />

            <form onSubmit={submit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <GlassCard className="p-6">
                            <div className="grid gap-5 sm:grid-cols-2">
                                {addingCustomer ? (
                                    <InlineCustomerFields
                                        customer={data.customer}
                                        errors={errors as Record<string, string>}
                                        setField={setCustomerField}
                                        onCancel={() => {
                                            setAddingCustomer(false);
                                            setData('customer', null);
                                            setData('customer_id', '');
                                        }}
                                    />
                                ) : (
                                    <FormField label="Customer" required error={errors.customer_id} htmlFor="customer_id">
                                        <SelectInput
                                            id="customer_id"
                                            options={customers.map((c) => ({ value: c.id, label: c.name }))}
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                            placeholder="Select customer…"
                                        />
                                        {canCreateCustomer && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddingCustomer(true);
                                                    setData('customer', { ...blankCustomer });
                                                    setData('customer_id', '');
                                                }}
                                                className="mt-2 text-xs font-medium text-white/50 transition-colors hover:text-accent"
                                            >
                                                ＋ New customer
                                            </button>
                                        )}
                                    </FormField>
                                )}
                                <FormField label="Currency" required error={errors.currency_code} htmlFor="currency_code">
                                    <SelectInput
                                        id="currency_code"
                                        options={currencies.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                                        value={data.currency_code}
                                        onChange={(e) => setData('currency_code', e.target.value)}
                                    />
                                </FormField>
                                <FormField label="Issue date" required error={errors.issue_date} htmlFor="issue_date">
                                    <DateInput
                                        id="issue_date"
                                        value={data.issue_date}
                                        onChange={(e) => setData('issue_date', e.target.value)}
                                    />
                                </FormField>
                                <FormField label="Due date" error={errors.due_date} htmlFor="due_date">
                                    <DateInput
                                        id="due_date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Line items</h2>
                            <div className="mt-5">
                                <InvoiceItemsEditor
                                    items={data.items}
                                    materials={materials}
                                    taxRates={taxRates}
                                    canManageCosts={canManageCosts}
                                    errors={errors as Record<string, string>}
                                    onChange={(items) => setData('items', items)}
                                />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <FormField label="Notes" error={errors.notes} htmlFor="notes">
                                <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            </FormField>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <InvoiceSummary
                            totals={totals}
                            currency={selectedCurrency?.code ?? data.currency_code}
                            discountType={data.discount_type}
                            discountValue={data.discount_value}
                            onDiscountTypeChange={(v) => setData('discount_type', v)}
                            onDiscountValueChange={(v) => setData('discount_value', v)}
                        />

                        <GlassCard className="p-6">
                            <PrimaryButton className="w-full" disabled={processing}>
                                {processing ? 'Creating draft…' : 'Create draft invoice'}
                            </PrimaryButton>
                            <p className="mt-3 text-xs leading-relaxed text-white/40">
                                Drafts can be edited freely until issued. Once issued, values are locked for auditing.
                            </p>
                        </GlassCard>
                    </div>
                </div>

                {typeof errors.items === 'string' && (
                    <p className="field-error mt-4">{errors.items}</p>
                )}
            </form>

            <div className="mt-6">
                <GlassButton href={route('invoices.index')} variant="secondary">Cancel</GlassButton>
            </div>
        </AuthenticatedLayout>
    );
}
