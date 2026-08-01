import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { Head, Link } from '@inertiajs/react';
import type { Material, Supplier, User } from '@/types/domain';

interface ShowProps {
    supplier: Supplier & { materials?: Material[]; users?: User[] };
    materialsCount: number;
    canManage: boolean;
}

export default function Show({ supplier, materialsCount, canManage }: ShowProps) {
    const details: [string, string][] = [
        ['Company', supplier.company_name ?? '—'],
        ['Contact person', supplier.contact_person ?? '—'],
        ['Email', supplier.email ?? '—'],
        ['Phone', supplier.phone ?? '—'],
        ['Tax number', supplier.tax_number ?? '—'],
        ['Registration', supplier.commercial_registration ?? '—'],
        ['City', supplier.city ?? '—'],
        ['Country', supplier.country_code ?? '—'],
        ['Address', supplier.address ?? '—'],
    ];

    return (
        <AuthenticatedLayout>
            <Head title={supplier.name} />

            <PageHeader title={supplier.name} description={supplier.company_name ?? 'Supplier'}>
                {canManage && <GlassButton href={route('suppliers.edit', supplier.id)} variant="secondary">Edit supplier</GlassButton>}
                <GlassButton href={route('materials.index', { supplier: supplier.id })}>View materials</GlassButton>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-6 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-xl italic text-white">Details</h2>
                        <StatusBadge
                            label={supplier.is_active ? 'Active' : 'Inactive'}
                            tone={supplier.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                        />
                    </div>

                    <dl className="mt-5 space-y-3.5 text-sm">
                        {details.map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between gap-4">
                                <dt className="text-white/40">{label}</dt>
                                <dd className="text-right text-white/80">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5 text-center">
                        <div>
                            <p className="font-heading text-2xl italic text-accent">{materialsCount}</p>
                            <p className="text-[11px] uppercase tracking-widest text-white/35">Materials</p>
                        </div>
                        <div>
                            <p className="font-heading text-2xl italic text-accent">{supplier.users?.length ?? 0}</p>
                            <p className="text-[11px] uppercase tracking-widest text-white/35">Accounts</p>
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-6 lg:col-span-2">
                    <GlassCard className="p-6">
                        <h2 className="font-heading text-xl italic text-white">Materials</h2>
                        {!supplier.materials || supplier.materials.length === 0 ? (
                            <EmptyState title="No materials yet" description="Materials from this supplier will appear here." />
                        ) : (
                            <ul className="mt-4 space-y-2">
                                {supplier.materials.map((material) => (
                                    <li key={material.id}>
                                        <Link
                                            href={route('materials.show', material.id)}
                                            className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                                        >
                                            <span className="text-sm text-white/80">{material.localized_name ?? material.name_en}</span>
                                            <span className="text-xs text-white/35">
                                                {material.sku}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h2 className="font-heading text-xl italic text-white">User accounts</h2>
                        {!supplier.users || supplier.users.length === 0 ? (
                            <p className="mt-4 text-sm text-white/40">No user accounts linked to this supplier.</p>
                        ) : (
                            <ul className="mt-4 space-y-2">
                                {supplier.users.map((user) => (
                                    <li key={user.id} className="flex items-center justify-between rounded-xl px-3 py-2.5">
                                        <span className="text-sm text-white/80">{user.name}</span>
                                        <span className="text-xs text-white/40">{user.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
