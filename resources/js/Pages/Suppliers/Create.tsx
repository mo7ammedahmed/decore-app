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

export default function Create() {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        tax_number: '',
        commercial_registration: '',
        address: '',
        city: '',
        country_code: 'SA',
        notes: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('suppliers.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('suppliers.create_title')} />

            <PageHeader title={t('suppliers.create_title')} description={t('suppliers.create_sub')} />

            <GlassCard className="max-w-3xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label={t('common.name')} required error={errors.name} htmlFor="name">
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                        </FormField>
                        <FormField label={t('common.company_name')} error={errors.company_name} htmlFor="company_name">
                            <TextInput id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.contact_person')} error={errors.contact_person} htmlFor="contact_person">
                            <TextInput id="contact_person" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.email')} error={errors.email} htmlFor="email">
                            <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.phone')} error={errors.phone} htmlFor="phone">
                            <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder={t('common.phone_placeholder')} />
                        </FormField>
                        <FormField label={t('common.tax_number')} error={errors.tax_number} htmlFor="tax_number">
                            <TextInput id="tax_number" value={data.tax_number} onChange={(e) => setData('tax_number', e.target.value)} />
                        </FormField>
                        <FormField label={t('common.commercial_registration')} error={errors.commercial_registration} htmlFor="commercial_registration">
                            <TextInput id="commercial_registration" value={data.commercial_registration} onChange={(e) => setData('commercial_registration', e.target.value)} />
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

                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40"
                        />
                        {t('suppliers.is_active')}
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <GlassButton href={route('suppliers.index')} variant="secondary">{t('common.cancel')}</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? t('common.creating') : t('suppliers.create')}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
