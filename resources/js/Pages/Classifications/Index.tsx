import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import GlassButton from '@/Components/GlassButton';
import { Head, Link } from '@inertiajs/react';
import type { Classification, Paginated } from '@/types/domain';

interface IndexProps {
    classifications: Paginated<Classification>;
    filters: { search?: string };
    canManage: boolean;
}

export default function Index({ classifications, filters, canManage }: IndexProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Classifications" />

            <PageHeader title="Classifications" description="Material categories used across the catalogue.">
                {canManage && <GlassButton href={route('classifications.create')}>New classification</GlassButton>}
            </PageHeader>

            <GlassCard className="p-6">
                {classifications.total === 0 ? (
                    <EmptyState title="No classifications yet" description="Create categories like Wood Alternatives or Flooring." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-glass w-full min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>Classification</th>
                                    <th>Slug</th>
                                    <th>Materials</th>
                                    <th>Order</th>
                                    <th>Status</th>
                                    {canManage && <th className="text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {classifications.data.map((classification) => (
                                    <tr key={classification.id}>
                                        <td className="font-medium text-white">{classification.localized_name ?? classification.name_en}</td>
                                        <td className="text-white/50">{classification.slug}</td>
                                        <td>{classification.materials_count ?? 0}</td>
                                        <td>{classification.sort_order}</td>
                                        <td>
                                            <StatusBadge
                                                label={classification.is_active ? 'Active' : 'Inactive'}
                                                tone={classification.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                            />
                                        </td>
                                        {canManage && (
                                            <td className="text-right">
                                                <Link href={route('classifications.edit', classification.id)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                    Edit
                                                </Link>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </AuthenticatedLayout>
    );
}
