import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import SelectInput from '@/Components/SelectInput';
import DateInput from '@/Components/DateInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import InvoiceItemsEditor, { computeItemTotals, type EditableItem } from '@/Components/InvoiceItemsEditor';
import InvoiceSummary from '@/Components/InvoiceSummary';
import InlineCustomerFields, { blankCustomer, type NewCustomer } from '@/Components/InlineCustomerFields';
import { useI18n } from '@/Utilities/i18n';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { DiscountType, Invoice, Material } from '@/types/domain';

interface EditProps {
    invoice: Invoice;
    customers: { id: number; name: string }[];
    materials: Material[];
    taxRates: { id: number; name: string; rate: string; is_default: boolean }[];
    permissions: { manageCosts: boolean } | null;
    canCreateCustomer: boolean;
}

export default function Edit({ invoice, customers, materials, taxRates, permissions, canCreateCustomer }: EditProps) {
    const { t } = useI18n();
    const canManageCosts = permissions?.manageCosts ?? false;
    const [addingCustomer, setAddingCustomer] = useState(false);

    const items: EditableItem[] = (invoice.items ?? []).map((item) => ({
        material_id: item.material_id !== null ? String(item.material_id) : '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost,
        discount_amount: item.discount_amount,
        tax_rate: item.tax_rate,
        description: item.description,
    }));

    const { data, setData, put, processing, errors } = useForm({
        customer_id: String(invoice.customer_id),
        customer: null as NewCustomer | null,
        issue_date: invoice.issue_date.slice(0, 10),
        due_date: invoice.due_date ?? '',
        discount_type: invoice.discount_type,
        discount_value: invoice.discount_value,
        notes: invoice.notes ?? '',
        items,
    });

    const totals = computeItemTotals(data.items);

    const setCustomerField = (field: keyof NewCustomer, value: string) => {
        setData('customer', { ...(data.customer ?? blankCustomer), [field]: value });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('invoices.update', invoice.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('invoices.edit_title', { number: invoice.invoice_number })} />

            <PageHeader
                title={t('invoices.edit_title', { number: invoice.invoice_number })}
                description={t('invoices.edit_sub')}
            />

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
                                            setData('customer_id', String(invoice.customer_id));
                                        }}
                                    />
                                ) : (
                                    <FormField label={t('invoices.customer')} required error={errors.customer_id} htmlFor="customer_id">
                                        <SelectInput
                                            id="customer_id"
                                            options={customers.map((c) => ({ value: c.id, label: c.name }))}
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                            placeholder={t('invoices.select_customer')}
                                        />
                                        {canCreateCustomer && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddingCustomer(true);
                                                    setData('customer', { ...blankCustomer });
                                                }}
                                                className="mt-2 text-xs font-medium text-white/50 transition-colors hover:text-accent"
                                            >
                                                {t('invoices.new_customer_link')}
                                            </button>
                                        )}
                                    </FormField>
                                )}
                                <div className="flex items-end gap-3">
                                    <FormField label={t('common.issue_date')} required error={errors.issue_date} htmlFor="issue_date">
                                        <DateInput
                                            id="issue_date"
                                            value={data.issue_date}
                                            onChange={(e) => setData('issue_date', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField label={t('common.due_date')} error={errors.due_date} htmlFor="due_date">
                                        <DateInput
                                            id="due_date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{t('invoices.line_items')}</h2>
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
                            <FormField label={t('common.notes')} error={errors.notes} htmlFor="notes">
                                <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            </FormField>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <InvoiceSummary
                            totals={totals}
                            currency={invoice.currency_code}
                            discountType={data.discount_type}
                            discountValue={data.discount_value}
                            onDiscountTypeChange={(v) => setData('discount_type', v)}
                            onDiscountValueChange={(v) => setData('discount_value', v)}
                        />

                        <GlassCard className="p-6">
                            <PrimaryButton className="w-full" disabled={processing}>
                                {processing ? t('common.saving') : t('invoices.save_draft')}
                            </PrimaryButton>
                            <p className="mt-3 text-xs leading-relaxed text-white/40">
                                {t('invoices.currency_fixed', { code: invoice.currency_code })}
                            </p>
                        </GlassCard>
                    </div>
                </div>
            </form>

            <div className="mt-6">
                <GlassButton href={route('invoices.show', invoice.id)} variant="secondary">{t('invoices.back_to_invoice')}</GlassButton>
            </div>
        </AuthenticatedLayout>
    );
}
