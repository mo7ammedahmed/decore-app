import PublicLayout from '@/Layouts/PublicLayout';
import PublicMaterialCard from '@/Components/PublicMaterialCard';
import SearchInput from '@/Components/SearchInput';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { Paginated, PublicMaterial } from '@/types/domain';
import type { PageProps } from '@/types';

interface CatalogProps extends PageProps {
    materials: Paginated<PublicMaterial>;
    classifications: { id: number; name_en: string; localized_name?: string }[];
    filters: {
        search?: string;
        classification?: string;
    };
}

export default function Catalog({ materials, classifications, filters }: CatalogProps) {
    const { t } = useI18n();

    const updateClassification = (value: string) => {
        router.get(
            route('catalog'),
            { ...filters, classification: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <PublicLayout title={t('catalog.title')}>
            <section className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{t('catalog.eyebrow')}</p>
                <h1 className="mt-3 text-5xl sm:text-6xl">{t('catalog.title')}</h1>
                <p className="mt-4 max-w-xl text-fg/50">
                    {t('catalog.sub')}
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput filters={filters} placeholder={t('catalog.search_placeholder')} />
                    <select
                        className="form-select w-full sm:w-auto"
                        value={filters.classification ?? ''}
                        onChange={(e) => updateClassification(e.target.value)}
                        aria-label={t('catalog.filter_label')}
                    >
                        <option value="" className="bg-canvas text-fg">{t('catalog.all_collections')}</option>
                        {classifications.map((c) => (
                            <option key={c.id} value={c.id} className="bg-canvas text-fg">{c.localized_name ?? c.name_en}</option>
                        ))}
                    </select>
                </div>

                {materials.total === 0 ? (
                    <div className="liquid-glass mt-8 rounded-modal">
                        <EmptyState
                            title={t('catalog.empty_title')}
                            description={t('catalog.empty_desc')}
                        />
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {materials.data.map((material) => (
                            <PublicMaterialCard key={material.id} material={material} />
                        ))}
                    </motion.div>
                )}

                <Pagination paginator={materials} />

                <p className="mt-6 text-center text-xs text-fg/30">
                    {t('catalog.prices_note')}
                </p>
            </section>
        </PublicLayout>
    );
}
