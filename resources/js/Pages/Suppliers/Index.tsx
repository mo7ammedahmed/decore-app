import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import GlassButton from '@/Components/GlassButton';
import { useI18n } from '@/Utilities/i18n';
import { Head, Link } from '@inertiajs/react';
import type { Paginated, Supplier } from '@/types/domain';

interface SuppliersIndexProps {
    suppliers: Paginated<Supplier>;
    filters: { search?: string };
    canManage: boolean;
}

export default function Index({ suppliers, filters, canManage }: SuppliersIndexProps) {
    const { t } = useI18n();

    return (
        <AuthenticatedLayout>
            <Head title={t('suppliers.title')} />

            <PageHeader title={t('suppliers.title')} description={t('suppliers.sub')}>
                {canManage && <GlassButton href={route('suppliers.create')}>{t('suppliers.new')}</GlassButton>}
            </PageHeader>

            <GlassCard className="p-6">
                <SearchInput filters={filters} placeholder={t('suppliers.search_placeholder')} />

                {suppliers.total === 0 ? (
                    <EmptyState title={t('suppliers.empty_title')} description={t('suppliers.empty_desc')} />
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="table-glass w-full min-w-[720px]">
                            <thead>
                                <tr>
                                    <th>{t('suppliers.col_supplier')}</th>
                                    <th>{t('common.contact')}</th>
                                    <th>{t('common.city')}</th>
                                    <th>{t('common.materials')}</th>
                                    <th>{t('suppliers.col_accounts')}</th>
                                    <th>{t('common.status')}</th>
                                    <th className="text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.data.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td>
                                            <Link href={route('suppliers.show', supplier.id)} className="font-medium text-white hover:text-accent">
                                                {supplier.name}
                                            </Link>
                                            {supplier.company_name && (
                                                <p className="text-xs text-white/40">{supplier.company_name}</p>
                                            )}
                                        </td>
                                        <td>
                                            <p>{supplier.contact_person ?? '—'}</p>
                                            <p className="text-xs text-white/40">{supplier.email ?? ''}</p>
                                        </td>
                                        <td>{supplier.city ?? '—'}</td>
                                        <td>{supplier.materials_count ?? 0}</td>
                                        <td>{supplier.users_count ?? 0}</td>
                                        <td>
                                            <StatusBadge
                                                label={supplier.is_active ? t('common.active') : t('common.inactive')}
                                                tone={supplier.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                            />
                                        </td>
                                        <td className="text-right">
                                            <Link
                                                href={route('suppliers.show', supplier.id)}
                                                className="text-sm text-white/60 transition-colors hover:text-accent"
                                            >
                                                {t('common.view')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination paginator={suppliers} />
            </GlassCard>
        </AuthenticatedLayout>
    );
}
