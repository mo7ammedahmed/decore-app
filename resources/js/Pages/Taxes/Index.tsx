import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { useI18n } from '@/Utilities/i18n';
import { Head, Link } from '@inertiajs/react';
import type { TaxRate } from '@/types/domain';

interface IndexProps {
    taxRates: TaxRate[];
}

export default function Index({ taxRates }: IndexProps) {
    const { t } = useI18n();

    return (
        <AuthenticatedLayout>
            <Head title={t('tax.title')} />

            <PageHeader title={t('tax.title')} description={t('tax.sub')}>
                <GlassButton href={route('taxes.create')}>{t('tax.new')}</GlassButton>
            </PageHeader>

            <GlassCard className="p-6">
                {taxRates.length === 0 ? (
                    <EmptyState title={t('tax.empty_title')} description={t('tax.empty_desc')} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-glass w-full min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>{t('tax.name')}</th>
                                    <th className="text-right">{t('tax.rate_column')}</th>
                                    <th>{t('tax.default')}</th>
                                    <th>{t('tax.status')}</th>
                                    <th className="text-right">{t('tax.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxRates.map((tax) => (
                                    <tr key={tax.id}>
                                        <td className="font-medium text-white/85">{tax.name}</td>
                                        <td className="text-right tabular-nums text-white/85">{tax.rate}%</td>
                                        <td>
                                            {tax.is_default ? (
                                                <StatusBadge label={t('tax.default')} tone="bg-accent/15 text-accent" />
                                            ) : (
                                                <span className="text-white/30">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <StatusBadge
                                                label={tax.is_active ? t('tax.active') : t('tax.inactive')}
                                                tone={tax.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                            />
                                        </td>
                                        <td className="text-right">
                                            <Link href={route('taxes.edit', tax.id)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                {t('tax.edit_link')}
                                            </Link>
                                        </td>
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
