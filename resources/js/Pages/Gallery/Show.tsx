import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import ImageUpload from '@/Components/ImageUpload';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { GalleryImage, GallerySection } from '@/types/domain';
import { useState } from 'react';

interface GalleryShowProps {
    section: GallerySection & { images?: GalleryImage[] };
}

export default function GalleryShow({ section }: GalleryShowProps) {
    const { t, locale } = useI18n();
    const [removing, setRemoving] = useState<GalleryImage | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const deleteForm = useForm({});

    const nameOf = (s: GallerySection) => (locale === 'ar' && s.name_ar ? s.name_ar : s.name_en);

    return (
        <AuthenticatedLayout>
            <Head title={nameOf(section)} />

            <PageHeader
                title={nameOf(section)}
                description={section.description_en || undefined}
            >
                <GlassButton href={route('gallery.edit', section.id)} variant="secondary">
                    {t('gallery.edit_section')}
                </GlassButton>
                <GlassButton href={route('gallery.index')} variant="secondary">
                    {t('gallery.back_to_gallery')}
                </GlassButton>
                <GlassButton onClick={() => setConfirmingDelete(true)} variant="danger" as="button">
                    {t('gallery.delete_section')}
                </GlassButton>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-6">
                    <h2 className="font-heading text-xl italic text-white">{t('gallery.upload_images')}</h2>
                    <p className="mt-2 text-sm text-white/40">{t('gallery.upload_hint')}</p>
                    <UploadForm section={section} />
                </GlassCard>

                <div className="lg:col-span-2">
                    {!section.images || section.images.length === 0 ? (
                        <GlassCard>
                            <EmptyState title={t('gallery.empty_title')} description={t('gallery.empty_desc')} icon="image" />
                        </GlassCard>
                    ) : (
                        <motion.div initial="hidden" animate="show" variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {section.images.map((image) => (
                                <GlassCard key={image.id} className="overflow-hidden p-0">
                                    <img
                                        src={image.image_url ?? undefined}
                                        alt={image.alt_text ?? nameOf(section)}
                                        className="aspect-square w-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="flex items-center gap-2 p-3">
                                        <p className="min-w-0 flex-1 truncate text-xs text-white/45">
                                            {image.original_name ?? image.alt_text ?? `#${image.id}`}
                                        </p>
                                        <GlassButton
                                            onClick={() => setRemoving(image)}
                                            variant="danger"
                                            as="button"
                                            className="!px-3 !py-1.5 !text-xs"
                                        >
                                            {t('gallery.remove')}
                                        </GlassButton>
                                    </div>
                                </GlassCard>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={removing !== null}
                onClose={() => setRemoving(null)}
                onConfirm={() => {
                    if (removing) router.delete(route('gallery.images.destroy', removing.id));
                    setRemoving(null);
                }}
                title={t('gallery.remove_confirm')}
                message={removing?.original_name ?? ''}
                confirmLabel={t('gallery.remove')}
                processing={deleteForm.processing}
            />

            <ConfirmDialog
                open={confirmingDelete}
                onClose={() => setConfirmingDelete(false)}
                onConfirm={() => deleteForm.delete(route('gallery.destroy', section.id))}
                title={t('gallery.delete_section_confirm')}
                message={nameOf(section)}
                confirmLabel={t('gallery.delete_section')}
                processing={deleteForm.processing}
            />
        </AuthenticatedLayout>
    );
}

function UploadForm({ section }: { section: GallerySection }) {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm<{
        image: File | null;
        alt_text: string;
    }>({
        image: null,
        alt_text: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('gallery.images.store', section.id), {
            onSuccess: () => setData({ image: null, alt_text: '' }),
        });
    };

    return (
        <form onSubmit={submit} className="mt-6 space-y-5">
            <FormField label={t('gallery.upload_images')} required error={errors.image}>
                <ImageUpload
                    value={data.image}
                    onChange={(file) => setData('image', file)}
                    error={errors.image}
                    maxSizeMb={8}
                />
            </FormField>

            <FormField label={t('gallery.alt_text')} error={errors.alt_text} htmlFor="alt_text">
                <TextInput
                    id="alt_text"
                    value={data.alt_text}
                    onChange={(e) => setData('alt_text', e.target.value)}
                    placeholder="Describe the image, e.g. 'Walnut wood-effect panels in a living room'"
                />
            </FormField>

            <div className="flex items-center justify-end gap-3">
                <PrimaryButton disabled={processing || !data.image}>
                    {processing ? t('gallery.uploading') : t('gallery.uploaded')}
                </PrimaryButton>
            </div>
        </form>
    );
}
