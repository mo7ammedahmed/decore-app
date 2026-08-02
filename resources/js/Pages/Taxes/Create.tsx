import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useI18n } from '@/Utilities/i18n';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        rate: '',
        is_default: false,
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('taxes.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('tax.new')} />

            <PageHeader title={t('tax.new')} description={t('tax.create_sub')} />

            <GlassCard className="max-w-xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label={t('tax.name')} required error={errors.name} htmlFor="name">
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                        </FormField>
                        <FormField label={t('tax.rate')} required error={errors.rate} htmlFor="rate">
                            <TextInput
                                id="rate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={data.rate}
                                onChange={(e) => setData('rate', e.target.value)}
                                required
                            />
                        </FormField>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={data.is_default}
                            onChange={(e) => setData('is_default', e.target.checked)}
                        />
                        {t('tax.is_default')}
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        {t('tax.active_immediately')}
                    </label>

                    <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-5">
                        <GlassButton href={route('taxes.index')} variant="secondary">{t('common.cancel')}</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? t('tax.creating') : t('tax.create')}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
