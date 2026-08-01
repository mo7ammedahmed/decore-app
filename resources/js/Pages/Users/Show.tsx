import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, router } from '@inertiajs/react';
import type { Invoice, User } from '@/types/domain';
import { formatDate, money } from '@/Utilities/format';
import { useState } from 'react';

interface ShowProps {
    user: User & { invoices?: Invoice[] };
    roleOptions: Record<string, string>;
}

const ROLE_TONES: Record<string, string> = {
    admin: 'bg-accent/15 text-accent',
    accountant: 'bg-info/15 text-info',
    sales_staff: 'bg-success/15 text-success',
    supplier: 'bg-warning/15 text-warning',
};

export default function Show({ user, roleOptions }: ShowProps) {
    const [confirmToggle, setConfirmToggle] = useState(false);

    const toggleActive = () => {
        router.post(route('users.toggle-active', user.id), {}, { preserveScroll: true });
        setConfirmToggle(false);
    };

    const details: [string, string][] = [
        ['Name', user.name],
        ['Email', user.email],
        ['Phone', user.phone ?? '—'],
        ['Role', roleOptions[user.role] ?? user.role],
        ['Supplier', user.supplier?.name ?? '—'],
        ['Joined', user.created_at ? formatDate(user.created_at) : '—'],
    ];

    return (
        <AuthenticatedLayout>
            <Head title={user.name} />

            <PageHeader title={user.name} description="Account details and activity.">
                <GlassButton href={route('users.edit', user.id)} variant="secondary">
                    Edit user
                </GlassButton>
                <GlassButton variant={user.is_active ? 'danger' : 'primary'} onClick={() => setConfirmToggle(true)}>
                    {user.is_active ? 'Disable account' : 'Activate account'}
                </GlassButton>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-6 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="liquid-glass-strong flex h-14 w-14 items-center justify-center rounded-full font-heading text-xl italic text-accent">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-heading text-xl italic text-white">{user.name}</h2>
                            <StatusBadge
                                label={user.is_active ? 'Active' : 'Disabled'}
                                tone={user.is_active ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}
                            />
                        </div>
                    </div>

                    <dl className="mt-6 space-y-4 text-sm">
                        {details.map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between gap-4">
                                <dt className="text-white/40">{label}</dt>
                                <dd className="text-right text-white/80">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </GlassCard>

                <GlassCard className="p-6 lg:col-span-2">
                    <h2 className="font-heading text-xl italic text-white">Recent invoices</h2>
                    {user.invoices && user.invoices.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="table-glass w-full min-w-[420px]">
                                <thead>
                                    <tr>
                                        <th>Number</th>
                                        <th>Issue date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td className="text-white">{invoice.invoice_number}</td>
                                            <td>{formatDate(invoice.issue_date)}</td>
                                            <td>{money(invoice.total, invoice.currency_code)}</td>
                                            <td>{invoice.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-white/40">No invoices recorded for this user yet.</p>
                    )}
                </GlassCard>
            </div>

            <ConfirmDialog
                open={confirmToggle}
                onClose={() => setConfirmToggle(false)}
                onConfirm={toggleActive}
                title={user.is_active ? 'Disable this account?' : 'Activate this account?'}
                message={
                    user.is_active
                        ? `${user.name} will immediately lose access to the application. You can re-enable it anytime.`
                        : `${user.name} will regain access to the application.`
                }
                confirmLabel={user.is_active ? 'Disable' : 'Activate'}
                danger={user.is_active}
            />
        </AuthenticatedLayout>
    );
}
