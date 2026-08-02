import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { useI18n } from '@/Utilities/i18n';
import { Head, Link } from '@inertiajs/react';
import type { Currency } from '@/types/domain';

interface IndexProps {
    currencies: Currency[];
}

export default function Index({ currencies }: IndexProps) {
    const { t } = useI18n();

    return (
        <AuthenticatedLayout>
            <Head title={t('currencies.title')} />

            <PageHeader title={t('currencies.title')} description={t('currencies.sub')}>
                <GlassButton href={route('currencies.create')}>{t('currencies.new')}</GlassButton>
            </PageHeader>

            <GlassCard className="p-6">
                {currencies.length === 0 ? (
                    <EmptyState title={t('currencies.empty_title')} description={t('currencies.empty_desc')} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-glass w-full min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>{t('currencies.col_code')}</th>
                                    <th>{t('common.name')}</th>
                                    <th>{t('currencies.col_symbol')}</th>
                                    <th className="text-right">{t('currencies.col_decimals')}</th>
                                    <th>{t('currencies.col_type')}</th>
                                    <th>{t('common.status')}</th>
                                    <th className="text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map((currency) => (
                                    <tr key={currency.code}>
                                        <td className="font-medium text-white/85">{currency.code}</td>
                                        <td>{currency.name}</td>
                                        <td>{currency.symbol ?? '—'}</td>
                                        <td className="text-right tabular-nums text-white/85">{currency.decimal_places}</td>
                                        <td>
                                            {currency.is_base ? (
                                                <StatusBadge label={t('currencies.base')} tone="bg-accent/15 text-accent" />
                                            ) : (
                                                <span className="text-white/30">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <StatusBadge
                                                label={currency.is_active ? t('common.active') : t('common.inactive')}
                                                tone={currency.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                            />
                                        </td>
                                        <td className="text-right">
                                            <Link href={route('currencies.edit', currency.code)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                {t('common.edit')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="mt-5 text-xs leading-relaxed text-white/35">
                    {t('currencies.footnote')}
                </p>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
