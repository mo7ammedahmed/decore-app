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
        name_en: '',
        name_ar: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('classifications.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('classifications.create_title')} />

            <PageHeader title={t('classifications.create_title')} description={t('classifications.create_sub')} />

            <GlassCard className="max-w-xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <FormField label={t('classifications.name_en')} required error={errors.name_en} hint={t('classifications.slug_hint')} htmlFor="name_en">
                        <TextInput id="name_en" value={data.name_en} onChange={(e) => setData('name_en', e.target.value)} required autoFocus />
                    </FormField>

                    <FormField label={t('classifications.name_ar')} error={errors.name_ar} htmlFor="name_ar">
                        <TextInput id="name_ar" value={data.name_ar} onChange={(e) => setData('name_ar', e.target.value)} dir="rtl" />
                    </FormField>

                    <FormField label={t('common.description')} error={errors.description} htmlFor="description">
                        <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    </FormField>

                    <FormField label={t('classifications.sort_order')} error={errors.sort_order} htmlFor="sort_order">
                        <TextInput id="sort_order" type="number" min={0} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} />
                    </FormField>

                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40"
                        />
                        {t('common.active')}
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <GlassButton href={route('classifications.index')} variant="secondary">{t('common.cancel')}</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? t('common.creating') : t('classifications.create')}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
