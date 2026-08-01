import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { GallerySection } from '@/types/domain';

interface GalleryIndexProps {
    sections: GallerySection[];
}

export default function GalleryIndex({ sections }: GalleryIndexProps) {
    const { t, locale } = useI18n();

    const nameOf = (section: GallerySection) => (locale === 'ar' && section.name_ar ? section.name_ar : section.name_en);

    return (
        <AuthenticatedLayout>
            <Head title={t('gallery.admin_title')} />

            <PageHeader title={t('gallery.admin_title')} description={t('gallery.admin_sub')}>
                <GlassButton href={route('gallery.create')}>{t('gallery.new_section')}</GlassButton>
            </PageHeader>

            {sections.length === 0 ? (
                <GlassCard>
                    <EmptyState title={t('gallery.empty_title')} description={t('gallery.empty_desc')} icon="image">
                        <GlassButton href={route('gallery.create')} className="mt-6">
                            {t('gallery.new_section')}
                        </GlassButton>
                    </EmptyState>
                </GlassCard>
            ) : (
                <motion.div initial="hidden" animate="show" variants={staggerContainer} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section) => (
                        <GlassCard key={section.id} className="p-6">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-heading text-xl italic text-white">{nameOf(section)}</h2>
                                <StatusBadge
                                    label={section.is_visible ? 'Visible' : 'Hidden'}
                                    tone={section.is_visible ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                />
                            </div>
                            {section.description_en && (
                                <p className="mt-2 line-clamp-2 text-sm text-white/45">
                                    {locale === 'ar' && section.description_ar ? section.description_ar : section.description_en}
                                </p>
                            )}
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">
                                {t('gallery.images', { count: section.images_count ?? 0 })}
                            </p>
                            <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-4">
                                <Link
                                    href={route('gallery.show', section.id)}
                                    className="text-sm font-medium text-accent transition-colors hover:text-accent/70"
                                >
                                    {t('gallery.upload_images')}
                                </Link>
                                <Link
                                    href={route('gallery.edit', section.id)}
                                    className="ms-auto text-sm font-medium text-white/50 transition-colors hover:text-white"
                                >
                                    {t('gallery.edit_section_short')}
                                </Link>
                            </div>
                        </GlassCard>
                    ))}
                </motion.div>
            )}
        </AuthenticatedLayout>
    );
}
