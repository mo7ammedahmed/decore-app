import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { Head, Link } from '@inertiajs/react';
import type { Currency } from '@/types/domain';

interface IndexProps {
    currencies: Currency[];
}

export default function Index({ currencies }: IndexProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Currencies" />

            <PageHeader title="Currencies" description="Invoicing currencies and the single base currency for reporting.">
                <GlassButton href={route('currencies.create')}>New currency</GlassButton>
            </PageHeader>

            <GlassCard className="p-6">
                {currencies.length === 0 ? (
                    <EmptyState title="No currencies" description="Add a currency to start invoicing in it." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-glass w-full min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Symbol</th>
                                    <th className="text-right">Decimals</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
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
                                                <StatusBadge label="Base" tone="bg-accent/15 text-accent" />
                                            ) : (
                                                <span className="text-white/30">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <StatusBadge
                                                label={currency.is_active ? 'Active' : 'Inactive'}
                                                tone={currency.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                            />
                                        </td>
                                        <td className="text-right">
                                            <Link href={route('currencies.edit', currency.code)} className="text-sm text-white/60 transition-colors hover:text-accent">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="mt-5 text-xs leading-relaxed text-white/35">
                    Only one currency can be the base. Invoices store the exchange rate at issue time, so historical
                    reports never change when rates are updated.
                </p>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
