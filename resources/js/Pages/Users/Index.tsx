import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import SearchInput from '@/Components/SearchInput';
import SelectInput from '@/Components/SelectInput';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import GlassButton from '@/Components/GlassButton';
import { Head, Link, router } from '@inertiajs/react';
import type { Paginated, User } from '@/types/domain';

interface UsersIndexProps {
    users: Paginated<User>;
    filters: { search?: string; role?: string };
    roleOptions: Record<string, string>;
}

const ROLE_TONES: Record<string, string> = {
    admin: 'bg-accent/15 text-accent',
    accountant: 'bg-info/15 text-info',
    sales_staff: 'bg-success/15 text-success',
    supplier: 'bg-warning/15 text-warning',
};

export default function Index({ users, filters, roleOptions }: UsersIndexProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Users" />

            <PageHeader title="Users" description="Manage accounts, roles and activation.">
                <GlassButton href={route('users.create')}>New user</GlassButton>
            </PageHeader>

            <GlassCard className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput filters={filters} placeholder="Search users…" />
                    <SelectInput
                        className="sm:w-48"
                        value={filters.role ?? ''}
                        onChange={(e) =>
                            router.get(route('users.index'), { ...filters, role: e.target.value || undefined }, { preserveState: true })
                        }
                        options={{ '': 'All roles', ...roleOptions }}
                    />
                </div>

                {users.total === 0 ? (
                    <EmptyState title="No users found" description="Try adjusting your filters or create a new user." />
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="table-glass w-full min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Contact</th>
                                    <th>Role</th>
                                    <th>Supplier</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <Link href={route('users.show', user.id)} className="font-medium text-white hover:text-accent">
                                                {user.name}
                                            </Link>
                                        </td>
                                        <td>
                                            <p>{user.email}</p>
                                            {user.phone && <p className="text-xs text-white/40">{user.phone}</p>}
                                        </td>
                                        <td>
                                            <StatusBadge
                                                label={roleOptions[user.role] ?? user.role}
                                                tone={ROLE_TONES[user.role] ?? 'bg-white/[0.06] text-white/60'}
                                                dot={false}
                                            />
                                        </td>
                                        <td>{user.supplier?.name ?? '—'}</td>
                                        <td>
                                            <StatusBadge
                                                label={user.is_active ? 'Active' : 'Disabled'}
                                                tone={user.is_active ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}
                                            />
                                        </td>
                                        <td className="text-right">
                                            <Link
                                                href={route('users.edit', user.id)}
                                                className="text-sm text-white/60 transition-colors hover:text-accent"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination paginator={users} />
            </GlassCard>
        </AuthenticatedLayout>
    );
}
