import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import PublicImage from '@/Components/PublicImage';
import EmptyState from '@/Components/EmptyState';
import PublicSectionHeading from '@/Components/PublicSectionHeading';
import GalleryLightbox, { type LightboxItem } from '@/Components/GalleryLightbox';
import { fadeUp, fadeUpTransition } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import { useMemo, useState } from 'react';
import type { GallerySection } from '@/types/domain';

interface GalleryProps {
    sections: (GallerySection & { images?: { id: number; image_url?: string | null; alt_text?: string | null; is_visible: boolean; sort_order: number }[] })[];
}

export default function PublicGallery({ sections }: GalleryProps) {
    const { t, locale } = useI18n();
    const [active, setActive] = useState<string>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const nameOf = (s: { name_en: string; name_ar?: string | null }) => (locale === 'ar' && s.name_ar ? s.name_ar : s.name_en);

    const filtered = active === 'all' ? sections : sections.filter((s) => s.id === Number(active));

    /** Flatten every visible image (in render order) for lightbox navigation. */
    const lightboxItems = useMemo<LightboxItem[]>(() => {
        const items: LightboxItem[] = [];
        for (const section of filtered) {
            const images = section.images?.filter((i) => i.is_visible !== false) ?? [];
            for (const image of images) {
                items.push({
                    id: image.id,
                    image_url: image.image_url,
                    alt_text: image.alt_text,
                    caption: nameOf(section),
                });
            }
        }
        return items;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, sections, locale]);

    const totalImages = filtered.reduce(
        (sum, s) => sum + (s.images?.filter((i) => i.is_visible !== false).length ?? 0),
        0,
    );

    return (
        <PublicLayout title={t('gallery.title')}>
            <Head>
                <meta name="description" content={t('gallery.sub')} />
                <meta property="og:title" content={t('gallery.title')} />
                <meta property="og:description" content={t('gallery.sub')} />
            </Head>

            <section className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
                <PublicSectionHeading
                    level="h1"
                    eyebrow={t('gallery.eyebrow')}
                    title={t('gallery.title')}
                    sub={t('gallery.sub')}
                />

                {/* Collection filters */}
                {sections.length > 0 && (
                    <div className="mt-10 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActive('all')}
                            aria-pressed={active === 'all'}
                            className={`rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                                active === 'all'
                                    ? 'border-accent bg-accent/10 text-fg'
                                    : 'border-line text-fg/55 hover:border-fg/30 hover:text-fg'
                            }`}
                        >
                            {t('gallery.all_sections')}
                        </button>
                        {sections.map((section) => {
                            const isActive = active === String(section.id);
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActive(isActive ? 'all' : String(section.id))}
                                    aria-pressed={isActive}
                                    className={`rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                                        isActive
                                            ? 'border-accent bg-accent/10 text-fg'
                                            : 'border-line text-fg/55 hover:border-fg/30 hover:text-fg'
                                    }`}
                                >
                                    {nameOf(section)}
                                </button>
                            );
                        })}
                        <span className="ms-2 text-xs text-fg/35">{t('catalog.results_count', { count: totalImages })}</span>
                    </div>
                )}

                {filtered.length === 0 || filtered.every((s) => !s.images || s.images.length === 0) ? (
                    <div className="mt-8 rounded-2xl border border-line bg-surface/40">
                        <EmptyState title={t('gallery.empty_title')} description={t('gallery.empty_desc')} icon="image" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="mt-12 space-y-16"
                        >
                            {filtered.map((section) => {
                                const images = section.images?.filter((i) => i.is_visible !== false) ?? [];
                                if (images.length === 0) return null;

                                return (
                                    <section key={section.id}>
                                        {/* Section introduction */}
                                        <motion.div
                                            initial={fadeUp.initial}
                                            animate={fadeUp.animate}
                                            transition={fadeUpTransition}
                                            className="max-w-2xl"
                                        >
                                            <h2 className="font-heading text-3xl italic text-fg sm:text-4xl">{nameOf(section)}</h2>
                                            {(locale === 'ar' ? section.description_ar : section.description_en) && (
                                                <p className="mt-3 text-sm leading-relaxed text-fg/50">
                                                    {locale === 'ar' ? section.description_ar : section.description_en}
                                                </p>
                                            )}
                                        </motion.div>

                                        {/* Editorial masonry — variable natural heights */}
                                        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
                                            {images.map((image, index) => (
                                                <motion.figure
                                                    key={image.id}
                                                    initial={{ opacity: 0, y: 16 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: '-40px' }}
                                                    transition={{ delay: (index % 3) * 0.06, duration: 0.5 }}
                                                    className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const i = lightboxItems.findIndex((item) => item.id === image.id);
                                                            if (i !== -1) setLightboxIndex(i);
                                                        }}
                                                        aria-label={`${t('gallery.lightbox_open')} — ${image.alt_text ?? nameOf(section)}`}
                                                        className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                                                    >
                                                        <PublicImage
                                                            src={image.image_url}
                                                            alt={image.alt_text ?? nameOf(section)}
                                                            label={nameOf(section)}
                                                            className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                                        />
                                                        <span className="pointer-events-none absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                                            </svg>
                                                        </span>
                                                    </button>
                                                    {image.alt_text && (
                                                        <figcaption className="pointer-events-none absolute bottom-0 start-0 end-0 translate-y-2 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                                            {image.alt_text}
                                                        </figcaption>
                                                    )}
                                                </motion.figure>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                )}
            </section>

            <GalleryLightbox
                items={lightboxItems}
                startIndex={lightboxIndex ?? 0}
                open={lightboxIndex !== null}
                onClose={() => setLightboxIndex(null)}
            />
        </PublicLayout>
    );
}
