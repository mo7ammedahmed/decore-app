import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import ImageUpload from '@/Components/ImageUpload';
import { useI18n } from '@/Utilities/i18n';
import { Head, router, useForm } from '@inertiajs/react';
import type { Classification } from '@/types/domain';
import { useState } from 'react';

export default function Edit({ classification }: { classification: Classification }) {
    const { t } = useI18n();
    const { data, setData, put, processing, errors } = useForm({
        name_en: classification.name_en,
        name_ar: classification.name_ar ?? '',
        description: classification.description ?? '',
        sort_order: classification.sort_order,
        is_active: classification.is_active,
    });

    const [confirmDelete, setConfirmDelete] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('classifications.update', classification.id));
    };

    const destroy = () => router.delete(route('classifications.destroy', classification.id));

    return (
        <AuthenticatedLayout>
            <Head title={t('classifications.edit_title')} />

            <PageHeader title={t('classifications.edit_title')} description={classification.slug}>
                <DangerButton onClick={() => setConfirmDelete(true)}>{t('common.archive')}</DangerButton>
            </PageHeader>

            <GlassCard className="max-w-xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <FormField label={t('classifications.name_en')} required error={errors.name_en} htmlFor="name_en">
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
                        <PrimaryButton disabled={processing}>{processing ? t('common.saving') : t('common.save_changes')}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={destroy}
                title={t('classifications.archive_confirm_title')}
                message={t('classifications.archive_confirm_message')}
                confirmLabel={t('common.archive')}
            />

            <ClassificationImageCard classification={classification} />
        </AuthenticatedLayout>
    );
}

/**
 * Inline upload/replace form for the collection cover shown on the landing
 * 'Shop by collection' tiles and the public catalogue. Falls back to the
 * newest material photo when no cover is uploaded.
 */
function ClassificationImageCard({ classification }: { classification: Classification }) {
    const { t } = useI18n();
    const isReplacement = Boolean(classification.image_url);
    const { data, setData, post, put, processing, errors } = useForm<{
        image: File | null;
        alt_text: string;
    }>({
        image: null,
        alt_text: classification.image_alt_text ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isReplacement) {
            put(route('classifications.image.update', classification.id));
        } else {
            post(route('classifications.image.store', classification.id));
        }
    };

    return (
        <GlassCard className="mt-6 max-w-xl p-8">
            <h2 className="font-heading text-xl italic text-white">{t('classifications.collection_image')}</h2>
            <p className="mt-1 text-sm text-white/40">
                {t('classifications.collection_image_sub')}
            </p>

            <form onSubmit={submit} className="mt-5 space-y-5">
                <FormField
                    label={isReplacement ? t('common.replace_image') : t('common.upload_image')}
                    required
                    error={errors.image}
                    hint={t('classifications.image_hint')}
                >
                    <ImageUpload
                        value={data.image}
                        onChange={(file) => setData('image', file)}
                        error={errors.image}
                        existingUrl={classification.image_url ?? null}
                        altText={data.alt_text}
                    />
                </FormField>

                <FormField label={t('common.alt_text')} error={errors.alt_text} htmlFor="classif_alt_text">
                    <TextInput
                        id="classif_alt_text"
                        value={data.alt_text}
                        onChange={(e) => setData('alt_text', e.target.value)}
                        placeholder={t('classifications.alt_placeholder')}
                    />
                </FormField>

                <div className="flex items-center justify-end gap-3">
                    <PrimaryButton disabled={processing || !data.image}>
                        {processing ? t('common.uploading') : isReplacement ? t('common.replace_image') : t('common.upload_image')}
                    </PrimaryButton>
                </div>
            </form>
        </GlassCard>
    );
}
