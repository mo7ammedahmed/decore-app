import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';
import type { Currency } from '@/types/domain';

interface EditProps {
    currency: Currency;
}

export default function Edit({ currency }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol ?? '',
        decimal_places: String(currency.decimal_places),
        is_base: currency.is_base,
        is_active: currency.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('currencies.update', currency.code));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${currency.code}`} />

            <PageHeader title="Edit currency" description={currency.code} />

            <GlassCard className="max-w-xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Code" required error={errors.code} htmlFor="code">
                            <TextInput id="code" value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase())} required maxLength={3} />
                        </FormField>
                        <FormField label="Name" required error={errors.name} htmlFor="name">
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </FormField>
                        <FormField label="Symbol" error={errors.symbol} htmlFor="symbol">
                            <TextInput id="symbol" value={data.symbol} onChange={(e) => setData('symbol', e.target.value)} />
                        </FormField>
                        <FormField label="Decimal places" required error={errors.decimal_places} htmlFor="decimal_places">
                            <TextInput id="decimal_places" type="number" min="0" max="4" step="1" value={data.decimal_places} onChange={(e) => setData('decimal_places', e.target.value)} required />
                        </FormField>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={data.is_base}
                            onChange={(e) => setData('is_base', e.target.checked)}
                        />
                        Make this the base currency
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        Active
                    </label>

                    <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-5">
                        <GlassButton href={route('currencies.index')} variant="secondary">Cancel</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Save changes'}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
