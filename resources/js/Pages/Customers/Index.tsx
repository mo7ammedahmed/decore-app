import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import GlassButton from '@/Components/GlassButton';
import { Head, Link } from '@inertiajs/react';
import type { Customer, Paginated } from '@/types/domain';

interface IndexProps {
    customers: Paginated<Customer>;
    filters: { search?: string; city?: string };
    canManage: boolean;
}

export default function Index({ customers, filters, canManage }: IndexProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Customers" />

            <PageHeader title="Customers" description="Everyone you sell to.">
                {canManage && <GlassButton href={route('customers.create')}>New customer</GlassButton>}
            </PageHeader>

            <GlassCard className="p-6">
                <SearchInput filters={filters} placeholder="Search customers…" />

                {customers.total === 0 ? (
                    <EmptyState title="No customers found" description="Try adjusting your search or create a new customer." />
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="table-glass w-full min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Company</th>
                                    <th>Contact</th>
                                    <th>City</th>
                                    <th>Invoices</th>
                                    <th className="text-right">Actions</th>
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
                                                View
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
