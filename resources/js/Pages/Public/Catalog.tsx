import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import PublicMaterialCard from '@/Components/PublicMaterialCard';
import PublicSectionHeading from '@/Components/PublicSectionHeading';
import SearchInput from '@/Components/SearchInput';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import { staggerContainer } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { Paginated, PublicMaterial } from '@/types/domain';
import type { PageProps } from '@/types';

interface CatalogProps extends PageProps {
    materials: Paginated<PublicMaterial>;
    classifications: { id: number; name_en: string; name_ar?: string | null; localized_name?: string }[];
    filters: {
        search?: string;
        classification?: string;
    };
}

export default function Catalog({ materials, classifications, filters }: CatalogProps) {
    const { t, locale } = useI18n();

    const hasFilters = Boolean(filters.search || filters.classification);

    const updateClassification = (value: string) => {
        router.get(
            route('catalog'),
            { ...filters, classification: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearFilters = () => {
        router.get(route('catalog'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const nameOf = (item: { name_en: string; name_ar?: string | null }) =>
        locale === 'ar' && item.name_ar ? item.name_ar : item.name_en;

    return (
        <PublicLayout title={t('catalog.title')}>
            <Head>
                <meta name="description" content={t('catalog.sub')} />
                <meta property="og:title" content={t('catalog.title')} />
                <meta property="og:description" content={t('catalog.sub')} />
            </Head>

            <section className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
                <PublicSectionHeading
                    level="h1"
                    eyebrow={t('catalog.eyebrow')}
                    title={t('catalog.title')}
                    sub={t('catalog.sub')}
                />

                {/* Toolbar */}
                <div className="mt-10 flex flex-col gap-5 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
                    <SearchInput filters={filters} placeholder={t('catalog.search_placeholder')} />

                    <div className="flex items-center gap-4">
                        {/* Scrollable classification chips */}
                        <div
                            role="group"
                            aria-label={t('catalog.filter_label')}
                            className="flex gap-2 overflow-x-auto pb-1 lg:max-w-xl [scrollbar-width:thin]"
                        >
                            <button
                                type="button"
                                onClick={() => updateClassification('')}
                                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                                    !filters.classification
                                        ? 'border-accent bg-accent/10 text-fg'
                                        : 'border-line text-fg/55 hover:border-fg/30 hover:text-fg'
                                }`}
                            >
                                {t('catalog.all_collections')}
                            </button>
                            {classifications.map((classification) => {
                                const active = filters.classification === String(classification.id);
                                return (
                                    <button
                                        key={classification.id}
                                        type="button"
                                        onClick={() => updateClassification(active ? '' : String(classification.id))}
                                        aria-pressed={active}
                                        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 ${
                                            active
                                                ? 'border-accent bg-accent/10 text-fg'
                                                : 'border-line text-fg/55 hover:border-fg/30 hover:text-fg'
                                        }`}
                                    >
                                        {nameOf(classification)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Result summary */}
                <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="text-sm text-fg/45">
                        {t('catalog.results_count', { count: materials.total })}
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        >
                            {t('catalog.clear')}
                        </button>
                    )}
                </div>

                {materials.total === 0 ? (
                    <div className="mt-8 rounded-2xl border border-line bg-surface/40">
                        <EmptyState title={t('catalog.empty_title')} description={t('catalog.empty_desc')} />
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                        {materials.data.map((material) => (
                            <PublicMaterialCard key={material.id} material={material} />
                        ))}
                    </motion.div>
                )}

                <Pagination paginator={materials} />
            </section>
        </PublicLayout>
    );
}
