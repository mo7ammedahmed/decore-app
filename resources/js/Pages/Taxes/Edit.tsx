import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { TaxRate } from '@/types/domain';

interface EditProps {
    taxRate: TaxRate;
}

export default function Edit({ taxRate }: EditProps) {
    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        name: taxRate.name,
        rate: taxRate.rate,
        is_default: taxRate.is_default,
        is_active: taxRate.is_active,
    });
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('taxes.update', taxRate.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${taxRate.name}`} />

            <PageHeader title="Edit tax rate" description={taxRate.name}>
                {!taxRate.is_default && (
                    <GlassButton onClick={() => setConfirmingDelete(true)} variant="danger" as="button">
                        Delete
                    </GlassButton>
                )}
            </PageHeader>

            <GlassCard className="max-w-xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Name" required error={errors.name} htmlFor="name">
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                        </FormField>
                        <FormField label="Rate (%)" required error={errors.rate} htmlFor="rate">
                            <TextInput
                                id="rate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={data.rate}
                                onChange={(e) => setData('rate', e.target.value)}
                                required
                            />
                        </FormField>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40 focus:ring-offset-0"
                            checked={data.is_default}
                            onChange={(e) => setData('is_default', e.target.checked)}
                        />
                        Use as the default rate for new invoices
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
                        <GlassButton href={route('taxes.index')} variant="secondary">Cancel</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Save changes'}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>

            <ConfirmDialog
                open={confirmingDelete}
                onClose={() => setConfirmingDelete(false)}
                onConfirm={() => destroy(route('taxes.destroy', taxRate.id))}
                title="Delete this tax rate?"
                message="Existing invoices keep their recorded rates; this only removes the rate from future use."
                confirmLabel="Delete rate"
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}
