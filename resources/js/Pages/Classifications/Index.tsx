import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import GlassButton from '@/Components/GlassButton';
import { useI18n } from '@/Utilities/i18n';
import { Head, Link } from '@inertiajs/react';
import type { Classification, Paginated } from '@/types/domain';

interface IndexProps {
    classifications: Paginated<Classification>;
    filters: { search?: string };
    canManage: boolean;
}

export default function Index({ classifications, canManage }: IndexProps) {
    const { t } = useI18n();

    return (
        <AuthenticatedLayout>
            <Head title={t('classifications.title')} />

            <PageHeader title={t('classifications.title')} description={t('classifications.sub')}>
                {canManage && <GlassButton href={route('classifications.create')}>{t('classifications.new')}</GlassButton>}
            </PageHeader>

            <GlassCard className="p-6">
                {classifications.total === 0 ? (
                    <EmptyState title={t('classifications.empty_title')} description={t('classifications.empty_desc')} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-glass w-full min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>{t('classifications.col_classification')}</th>
                                    <th>{t('classifications.col_slug')}</th>
                                    <th>{t('common.materials')}</th>
                                    <th>{t('classifications.col_order')}</th>
                                    <th>{t('common.status')}</th>
                                    {canManage && <th className="text-right">{t('common.actions')}</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {classifications.data.map((classification) => (
                                    <tr key={classification.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {classification.image_url && (
                                                    <img
                                                        src={classification.image_url}
                                                        alt={classification.image_alt_text ?? classification.localized_name ?? classification.name_en}
                                                        className="h-10 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
                                                    />
                                                )}
                                                <span className="font-medium text-white">{classification.localized_name ?? classification.name_en}</span>
                                            </div>
                                        </td>
                                        <td className="text-white/50">{classification.slug}</td>
                                        <td>{classification.materials_count ?? 0}</td>
                                        <td>{classification.sort_order}</td>
                                        <td>
                                            <StatusBadge
                                                label={classification.is_active ? t('common.active') : t('common.inactive')}
                                                tone={classification.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                            />
                                        </td>
                                        {canManage && (
                                            <td className="text-right">
                                                <Link href={route('classifications.edit', classification.id)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                    {t('common.edit')}
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
