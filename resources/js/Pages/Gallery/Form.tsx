import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';
import { useI18n } from '@/Utilities/i18n';
import type { GallerySection } from '@/types/domain';

interface GalleryFormProps {
    section: GallerySection | null;
}

export default function GalleryForm({ section }: GalleryFormProps) {
    const { t } = useI18n();
    const isEditing = section !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name_en: section?.name_en ?? '',
        name_ar: section?.name_ar ?? '',
        description_en: section?.description_en ?? '',
        description_ar: section?.description_ar ?? '',
        is_visible: section?.is_visible ?? true,
        sort_order: section?.sort_order ?? 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('gallery.update', section.id));
        } else {
            post(route('gallery.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? t('gallery.edit_section') : t('gallery.new_section')} />

            <PageHeader title={isEditing ? t('gallery.edit_section') : t('gallery.new_section')} description={t('gallery.admin_sub')} />

            <GlassCard className="max-w-xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <FormField label={t('gallery.section_name_en')} required error={errors.name_en} htmlFor="name_en">
                        <TextInput id="name_en" value={data.name_en} onChange={(e) => setData('name_en', e.target.value)} required autoFocus />
                    </FormField>

                    <FormField label={t('gallery.section_name_ar')} error={errors.name_ar} htmlFor="name_ar">
                        <TextInput id="name_ar" value={data.name_ar} onChange={(e) => setData('name_ar', e.target.value)} dir="rtl" />
                    </FormField>

                    <FormField label={t('gallery.description_en')} error={errors.description_en} htmlFor="description_en">
                        <Textarea id="description_en" value={data.description_en} onChange={(e) => setData('description_en', e.target.value)} />
                    </FormField>

                    <FormField label={t('gallery.description_ar')} error={errors.description_ar} htmlFor="description_ar">
                        <Textarea id="description_ar" value={data.description_ar} onChange={(e) => setData('description_ar', e.target.value)} dir="rtl" />
                    </FormField>

                    <FormField label={t('gallery.sort_order')} error={errors.sort_order} htmlFor="sort_order">
                        <TextInput id="sort_order" type="number" min={0} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} />
                    </FormField>

                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <input
                            type="checkbox"
                            checked={data.is_visible}
                            onChange={(e) => setData('is_visible', e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40"
                        />
                        {t('gallery.visible')}
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <GlassButton href={route('gallery.index')} variant="secondary">{t('common.cancel')}</GlassButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? (isEditing ? t('common.saving') : t('common.creating')) : isEditing ? t('common.save_changes') : t('gallery.new_section')}
                        </PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
