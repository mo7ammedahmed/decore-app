import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import SelectInput from '@/Components/SelectInput';
import CurrencyInput from '@/Components/CurrencyInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useI18n } from '@/Utilities/i18n';
import { Head, useForm } from '@inertiajs/react';
import type { Currency, Unit } from '@/types/domain';

interface CreateProps {
    classifications: { id: number; name_en: string; localized_name?: string }[];
    suppliers: { id: number; name: string }[];
    currencies: Currency[];
    unitOptions: Record<Unit, string>;
    isSupplierRole: boolean;
}

export default function Create({
    classifications,
    suppliers,
    currencies,
    unitOptions,
    isSupplierRole,
}: CreateProps) {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: isSupplierRole ? (suppliers[0]?.id ?? '') : '',
        classification_id: '',
        name_en: '',
        name_ar: '',
        sku: '',
        description: '',
        unit: 'piece',
        selling_price: '',
        default_supplier_cost: '',
        currency_code: 'SAR',
        stock_quantity: '',
        minimum_stock_level: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('materials.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('materials.create_title')} />

            <PageHeader title={t('materials.create_title')} description={t('materials.create_sub')} />

            <GlassCard className="max-w-3xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label={t('materials.name_en')} required error={errors.name_en} htmlFor="name_en">
                            <TextInput id="name_en" value={data.name_en} onChange={(e) => setData('name_en', e.target.value)} required autoFocus />
                        </FormField>
                        <FormField label={t('materials.name_ar')} error={errors.name_ar} htmlFor="name_ar">
                            <TextInput id="name_ar" value={data.name_ar} onChange={(e) => setData('name_ar', e.target.value)} dir="rtl" />
                        </FormField>
                        <FormField label={t('common.sku')} required error={errors.sku} htmlFor="sku">
                            <TextInput id="sku" value={data.sku} onChange={(e) => setData('sku', e.target.value)} required placeholder={t('materials.sku_placeholder')} />
                        </FormField>
                        <FormField label={t('materials.classification')} required error={errors.classification_id} htmlFor="classification_id">
                            <SelectInput
                                id="classification_id"
                                options={classifications.map((c) => ({ value: c.id, label: c.localized_name ?? c.name_en }))}
                                value={data.classification_id}
                                onChange={(e) => setData('classification_id', e.target.value)}
                                placeholder={t('materials.select_classification')}
                            />
                        </FormField>
                        {!isSupplierRole && (
                            <FormField label={t('common.supplier')} required error={errors.supplier_id} htmlFor="supplier_id">
                                <SelectInput
                                    id="supplier_id"
                                    options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    placeholder={t('materials.select_supplier')}
                                />
                            </FormField>
                        )}
                        <FormField label={t('common.unit')} required error={errors.unit} htmlFor="unit">
                            <SelectInput
                                id="unit"
                                options={unitOptions}
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                            />
                        </FormField>
                        <FormField label={t('common.currency')} required error={errors.currency_code} htmlFor="currency_code">
                            <SelectInput
                                id="currency_code"
                                options={currencies.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                                value={data.currency_code}
                                onChange={(e) => setData('currency_code', e.target.value)}
                            />
                        </FormField>
                        <FormField label={t('materials.selling_price')} required error={errors.selling_price} htmlFor="selling_price" hint={t('materials.price_hint')}>
                            <CurrencyInput
                                id="selling_price"
                                value={data.selling_price}
                                onChange={(e) => setData('selling_price', e.target.value)}
                                currency={data.currency_code}
                                required
                            />
                        </FormField>
                        <FormField label={t('materials.default_supplier_cost')} error={errors.default_supplier_cost} htmlFor="default_supplier_cost" hint={t('materials.cost_hint_create')}>
                            <CurrencyInput
                                id="default_supplier_cost"
                                value={data.default_supplier_cost}
                                onChange={(e) => setData('default_supplier_cost', e.target.value)}
                                currency={data.currency_code}
                            />
                        </FormField>
                        <FormField label={t('materials.stock_quantity')} error={errors.stock_quantity} htmlFor="stock_quantity">
                            <TextInput id="stock_quantity" type="number" min="0" step="1" value={data.stock_quantity} onChange={(e) => setData('stock_quantity', e.target.value)} />
                        </FormField>
                        <FormField label={t('materials.minimum_stock_level')} error={errors.minimum_stock_level} htmlFor="minimum_stock_level">
                            <TextInput id="minimum_stock_level" type="number" min="0" step="1" value={data.minimum_stock_level} onChange={(e) => setData('minimum_stock_level', e.target.value)} />
                        </FormField>
                    </div>

                    <FormField label={t('common.description')} error={errors.description} htmlFor="description">
                        <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    </FormField>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        {t('materials.active_immediately')}
                    </label>

                    <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-5">
                        <GlassButton href={route('materials.index')} variant="secondary">{t('common.cancel')}</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? t('common.creating') : t('materials.create')}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
