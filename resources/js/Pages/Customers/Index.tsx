import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import GlassButton from '@/Components/GlassButton';
import { useI18n } from '@/Utilities/i18n';
import { Head, Link } from '@inertiajs/react';
import type { Customer, Paginated } from '@/types/domain';

interface IndexProps {
    customers: Paginated<Customer>;
    filters: { search?: string; city?: string };
    canManage: boolean;
}

export default function Index({ customers, filters, canManage }: IndexProps) {
    const { t } = useI18n();

    return (
        <AuthenticatedLayout>
            <Head title={t('customers.title')} />

            <PageHeader title={t('customers.title')} description={t('customers.sub')}>
                {canManage && <GlassButton href={route('customers.create')}>{t('customers.new')}</GlassButton>}
            </PageHeader>

            <GlassCard className="p-6">
                <SearchInput filters={filters} placeholder={t('customers.search_placeholder')} />

                {customers.total === 0 ? (
                    <EmptyState title={t('customers.empty_title')} description={t('customers.empty_desc')} />
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="table-glass w-full min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>{t('customers.col_customer')}</th>
                                    <th>{t('common.company')}</th>
                                    <th>{t('common.contact')}</th>
                                    <th>{t('common.city')}</th>
                                    <th>{t('customers.col_invoices')}</th>
                                    <th className="text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>
                                            <Link href={route('customers.show', customer.id)} className="font-medium text-white hover:text-accent">
                                                {customer.name}
                                            </Link>
                                        </td>
                                        <td>{customer.company_name ?? '—'}</td>
                                        <td>
                                            <p>{customer.phone ?? '—'}</p>
                                            <p className="text-xs text-white/40">{customer.email ?? ''}</p>
                                        </td>
                                        <td>{customer.city ?? '—'}</td>
                                        <td>{customer.invoices_count ?? 0}</td>
                                        <td className="text-right">
                                            <Link href={route('customers.show', customer.id)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                {t('common.view')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination paginator={customers} />
            </GlassCard>
        </AuthenticatedLayout>
    );
}
