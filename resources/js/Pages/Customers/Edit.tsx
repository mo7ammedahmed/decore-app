import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import { useI18n } from '@/Utilities/i18n';
import { Head, useForm } from '@inertiajs/react';
import type { Customer } from '@/types/domain';

export default function Edit({ customer }: { customer: Customer }) {
    const { t } = useI18n();
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        company_name: customer.company_name ?? '',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        tax_number: customer.tax_number ?? '',
        address: customer.address ?? '',
        city: customer.city ?? '',
        country_code: customer.country_code ?? 'SA',
        notes: customer.notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('customers.update', customer.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('customers.edit_title')} />

            <PageHeader title={t('customers.edit_title')} description={customer.name} />

            <GlassCard className="max-w-3xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label={t('common.name')} required error={errors.name} htmlFor="name">
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                        </FormField>
                        <FormField label={t('common.company_name')} error={errors.company_name} htmlFor="company_name">
                            <TextInput id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.email')} error={errors.email} htmlFor="email">
                            <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.phone')} error={errors.phone} htmlFor="phone">
                            <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.tax_number')} error={errors.tax_number} htmlFor="tax_number">
                            <TextInput id="tax_number" value={data.tax_number} onChange={(e) => setData('tax_number', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.city')} error={errors.city} htmlFor="city">
                            <TextInput id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                        </FormField>
                    </div>

                    <FormField label={t('common.address')} error={errors.address} htmlFor="address">
                        <TextInput id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    </FormField>

                    <FormField label={t('common.notes')} error={errors.notes} htmlFor="notes">
                        <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </FormField>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <GlassButton href={route('customers.show', customer.id)} variant="secondary">{t('common.cancel')}</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? t('common.saving') : t('common.save_changes')}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
