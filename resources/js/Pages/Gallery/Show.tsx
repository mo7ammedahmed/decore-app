import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { GalleryImage, GallerySection } from '@/types/domain';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';

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

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_MB = 7;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
const MAX_FILES = 20;

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function UploadForm({ section }: { section: GallerySection }) {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm<{
        images: File[];
        alt_text: string;
    }>({
        images: [],
        alt_text: '',
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [localErrors, setLocalErrors] = useState<string[]>([]);
    // Object URLs for previews, created once per file and revoked when the
    // file is removed or the form unmounts — avoids leaking blob URLs.
    const previewUrls = useRef(new Map<string, string>());

    useEffect(() => {
        const urls = previewUrls.current;
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
        };
    }, []);

    const imageErrors = Object.entries(errors)
        .filter(([key]) => key === 'images' || key.startsWith('images.'))
        .map(([, value]) => value);
    const shownErrors = [...localErrors, ...imageErrors];

    // Stable per-file identity so removing a file from the middle of the list
    // doesn't shift indices and orphan a cached preview URL.
    const fileKey = (file: File): string => `${file.name}:${file.size}:${file.lastModified}`;

    const previewFor = (file: File): string => {
        const key = fileKey(file);
        const cached = previewUrls.current.get(key);
        if (cached) return cached;
        const url = URL.createObjectURL(file);
        previewUrls.current.set(key, url);
        return url;
    };

    const acceptFiles = (files: FileList | null) => {
        if (!files) return;

        const accepted: File[] = [];
        const rejected: string[] = [];

        Array.from(files).forEach((file) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                rejected.push(`${file.name}: ${t('gallery.file_type_error')}`);
            } else if (file.size > MAX_IMAGE_BYTES) {
                rejected.push(`${file.name}: ${t('gallery.file_size_error', { mb: MAX_IMAGE_MB })}`);
            } else {
                accepted.push(file);
            }
        });

        const combined = [...data.images, ...accepted];
        if (combined.length > MAX_FILES) {
            rejected.push(t('gallery.max_files_error', { count: MAX_FILES }));
        }
        // Create preview URLs up front so render never runs side effects.
        const kept = combined.slice(0, MAX_FILES);
        kept.forEach((file) => previewFor(file));
        setData('images', kept);
        setLocalErrors(rejected);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        acceptFiles(e.target.files);
        e.target.value = '';
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        acceptFiles(e.dataTransfer.files);
    };

    const openPicker = () => {
        if (!processing) inputRef.current?.click();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && !processing) {
            e.preventDefault();
            openPicker();
        }
    };

    const removeFile = (index: number) => {
        const file = data.images[index];
        if (file) {
            const key = fileKey(file);
            const url = previewUrls.current.get(key);
            if (url) {
                URL.revokeObjectURL(url);
                previewUrls.current.delete(key);
            }
        }
        setData('images', data.images.filter((_, i) => i !== index));
        setLocalErrors([]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.images.length === 0) return;
        post(route('gallery.images.store', section.id), {
            onSuccess: () => {
                previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
                previewUrls.current.clear();
                setData({ images: [], alt_text: '' });
                setLocalErrors([]);
            },
        });
    };

    return (
        <form onSubmit={submit} className="mt-6 space-y-5">
            <FormField label={t('gallery.upload_images')} required error={shownErrors.join(' ')}>
                <div
                    role="button"
                    tabIndex={0}
                    aria-label={t('gallery.select_images')}
                    onClick={openPicker}
                    onKeyDown={handleKeyDown}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`liquid-glass group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed p-6 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                        dragOver ? 'border-accent/60 bg-accent/5' : 'border-white/15'
                    } ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="sr-only"
                        onChange={handleInputChange}
                        disabled={processing}
                    />
                    <div className="liquid-glass-strong flex h-12 w-12 items-center justify-center rounded-full">
                        <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-14-2V5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                            <circle cx="8.5" cy="7.5" r="1.5" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white/75">{t('gallery.click_or_drop')}</p>
                        <p className="mt-1 text-xs text-white/35">
                            {t('gallery.select_many_hint')} · max {MAX_IMAGE_MB}MB each
                        </p>
                    </div>
                </div>
            </FormField>

            {data.images.length > 0 && (
                <ul className="space-y-2">
                    {data.images.map((file, index) => (
                        <li
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                        >
                            <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white/5">
                                <img src={previewFor(file)} alt="" className="h-full w-full object-cover" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-white/80">{file.name}</span>
                                <span className="text-xs text-white/40">{formatBytes(file.size)}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger"
                            >
                                {t('gallery.remove')}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <FormField label={t('gallery.alt_text')} error={errors.alt_text} htmlFor="alt_text">
                <TextInput
                    id="alt_text"
                    value={data.alt_text}
                    onChange={(e) => setData('alt_text', e.target.value)}
                    placeholder="Describe the images, e.g. 'Walnut wood-effect panels in a living room'"
                />
            </FormField>

            <div className="flex items-center justify-end gap-3">
                <PrimaryButton disabled={processing || data.images.length === 0}>
                    {processing
                        ? t('gallery.uploading')
                        : data.images.length > 1
                          ? t('gallery.upload_selected', { count: data.images.length })
                          : t('gallery.uploaded')}
                </PrimaryButton>
            </div>
        </form>
    );
}
