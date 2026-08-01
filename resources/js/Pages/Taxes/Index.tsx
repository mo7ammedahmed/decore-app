import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { Head, Link } from '@inertiajs/react';
import type { TaxRate } from '@/types/domain';

interface IndexProps {
    taxRates: TaxRate[];
}

export default function Index({ taxRates }: IndexProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Tax rates" />

            <PageHeader title="Tax rates" description="VAT and other rates applied per invoice line. Prices are tax-exclusive.">
                <GlassButton href={route('taxes.create')}>New tax rate</GlassButton>
            </PageHeader>

            <GlassCard className="p-6">
                {taxRates.length === 0 ? (
                    <EmptyState title="No tax rates" description="Create a rate to apply it to invoice lines." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-glass w-full min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th className="text-right">Rate</th>
                                    <th>Default</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxRates.map((tax) => (
                                    <tr key={tax.id}>
                                        <td className="font-medium text-white/85">{tax.name}</td>
                                        <td className="text-right tabular-nums text-white/85">{tax.rate}%</td>
                                        <td>
                                            {tax.is_default ? (
                                                <StatusBadge label="Default" tone="bg-accent/15 text-accent" />
                                            ) : (
                                                <span className="text-white/30">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <StatusBadge
                                                label={tax.is_active ? 'Active' : 'Inactive'}
                                                tone={tax.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                            />
                                        </td>
                                        <td className="text-right">
                                            <Link href={route('taxes.edit', tax.id)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                Edit
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
