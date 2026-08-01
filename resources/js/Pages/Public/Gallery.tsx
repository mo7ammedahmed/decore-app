import PublicLayout from '@/Layouts/PublicLayout';
import EmptyState from '@/Components/EmptyState';
import GalleryLightbox, { type LightboxItem } from '@/Components/GalleryLightbox';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/Utilities/motion';
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

    /**
     * Flatten every visible image (in render order) into a single list so the
     * lightbox can navigate across sections with prev/next. Built from the
     * filtered view so the arrows only walk the images currently on screen.
     */
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
    }, [filtered, locale]);

    return (
        <PublicLayout title={t('gallery.title')}>
            <section className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{t('gallery.eyebrow')}</p>
                <h1 className="mt-3 text-5xl sm:text-6xl">{t('gallery.title')}</h1>
                <p className="mt-4 max-w-xl text-fg/50">{t('gallery.sub')}</p>

                {sections.length > 0 && (
                    <div className="mt-10 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActive('all')}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                                active === 'all'
                                    ? 'liquid-glass-strong text-fg'
                                    : 'liquid-glass text-fg/60 hover:text-fg'
                            }`}
                        >
                            {t('gallery.all_sections')}
                        </button>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActive(String(section.id))}
                                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                                    active === String(section.id)
                                        ? 'liquid-glass-strong text-fg'
                                        : 'liquid-glass text-fg/60 hover:text-fg'
                                }`}
                            >
                                {nameOf(section)}
                            </button>
                        ))}
                    </div>
                )}

                {filtered.length === 0 || filtered.every((s) => !s.images || s.images.length === 0) ? (
                    <div className="liquid-glass mt-8 rounded-modal">
                        <EmptyState title={t('gallery.empty_title')} description={t('gallery.empty_desc')} icon="image" />
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="mt-10 space-y-14">
                        {filtered.map((section) => {
                            const images = section.images?.filter((i) => i.is_visible !== false) ?? [];
                            if (images.length === 0) return null;

                            return (
                                <section key={section.id}>
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <h2 className="font-heading text-3xl italic text-fg">{nameOf(section)}</h2>
                                            {locale === 'ar' && section.description_ar ? (
                                                <p className="mt-2 max-w-lg text-sm text-fg/45">{section.description_ar}</p>
                                            ) : section.description_en ? (
                                                <p className="mt-2 max-w-lg text-sm text-fg/45">{section.description_en}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {images.map((image, index) => (
                                            <motion.figure
                                                key={image.id}
                                                initial={{ opacity: 0, y: 16 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: '-40px' }}
                                                transition={{ delay: (index % 3) * 0.06, duration: 0.5 }}
                                                className="group relative overflow-hidden rounded-card"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const i = lightboxItems.findIndex((item) => item.id === image.id);
                                                        if (i !== -1) setLightboxIndex(i);
                                                    }}
                                                    aria-label={`${t('gallery.lightbox_open')} — ${image.alt_text ?? nameOf(section)}`}
                                                    className="relative block w-full cursor-zoom-in overflow-hidden rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
                                                >
                                                    <img
                                                        src={image.image_url ?? undefined}
                                                        alt={image.alt_text ?? nameOf(section)}
                                                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                        loading="lazy"
                                                    />
                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                    <span className="pointer-events-none absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                                        </svg>
                                                    </span>
                                                </button>
                                                {image.alt_text && (
                                                    <figcaption className="pointer-events-none absolute bottom-0 start-0 end-0 translate-y-2 p-4 text-sm text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
