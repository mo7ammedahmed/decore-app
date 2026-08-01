import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import MaterialCard from '@/Components/MaterialCard';
import GlassButton from '@/Components/GlassButton';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/Utilities/motion';
import type { Classification, Material, Paginated, Unit } from '@/types/domain';

interface IndexProps {
    materials: Paginated<Material>;
    filters: {
        search?: string;
        classification?: string;
        supplier?: string;
        status?: string;
        low_stock?: string;
    };
    classifications: { id: number; name_en: string; localized_name?: string }[];
    suppliers: { id: number; name: string }[];
    unitOptions: Record<Unit, string>;
    canManage: boolean;
}

export default function Index({
    materials,
    filters,
    classifications,
    suppliers,
    unitOptions,
    canManage,
}: IndexProps) {
    const updateFilter = (key: string, value: string) => {
        router.get(
            route('materials.index'),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const filterControl =
        'form-select w-full sm:w-auto';

    return (
        <AuthenticatedLayout>
            <Head title="Materials" />

            <PageHeader title="Materials" description="The catalog of everything you source and sell.">
                {canManage && <GlassButton href={route('materials.create')}>New material</GlassButton>}
            </PageHeader>

            <GlassCard className="p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <SearchInput filters={filters} placeholder="Search by name or SKU…" />
                    <select
                        className={filterControl}
                        value={filters.classification ?? ''}
                        onChange={(e) => updateFilter('classification', e.target.value)}
                    >
                        <option value="" className="bg-neutral-900">All classifications</option>
                        {classifications.map((c) => (
                            <option key={c.id} value={c.id} className="bg-neutral-900">{c.localized_name ?? c.name_en}</option>
                        ))}
                    </select>
                    <select
                        className={filterControl}
                        value={filters.supplier ?? ''}
                        onChange={(e) => updateFilter('supplier', e.target.value)}
                    >
                        <option value="" className="bg-neutral-900">All suppliers</option>
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.id} className="bg-neutral-900">{s.name}</option>
                        ))}
                    </select>
                    <select
                        className={filterControl}
                        value={filters.status ?? ''}
                        onChange={(e) => updateFilter('status', e.target.value)}
                    >
                        <option value="" className="bg-neutral-900">Any status</option>
                        <option value="active" className="bg-neutral-900">Active</option>
                        <option value="inactive" className="bg-neutral-900">Archived</option>
                    </select>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/55">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={filters.low_stock === '1'}
                            onChange={(e) => updateFilter('low_stock', e.target.checked ? '1' : '')}
                        />
                        Low stock
                    </label>
                </div>

                {materials.total === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            title="No materials found"
                            description="Try adjusting your filters, or create a new material."
                        />
                    </div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    >
                        {materials.data.map((material) => (
                            <MaterialCard key={material.id} material={material} />
                        ))}
                    </motion.div>
                )}

                <Pagination paginator={materials} />
            </GlassCard>

            <p className="mt-4 text-center text-xs text-white/30">
                Selling prices are shown without tax · Units: {Object.values(unitOptions).join(', ')} ·{' '}
                <Link href={route('materials.index', { low_stock: '1' })} className="text-white/45 underline-offset-2 hover:text-accent hover:underline">
                    View low-stock only
                </Link>
            </p>
        </AuthenticatedLayout>
    );
}
