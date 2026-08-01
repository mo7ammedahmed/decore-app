import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import DangerButton from '@/Components/DangerButton';
import { Head, router, useForm } from '@inertiajs/react';
import type { Supplier } from '@/types/domain';
import { useState } from 'react';

export default function Edit({ supplier }: { supplier: Supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name,
        company_name: supplier.company_name ?? '',
        contact_person: supplier.contact_person ?? '',
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        tax_number: supplier.tax_number ?? '',
        commercial_registration: supplier.commercial_registration ?? '',
        address: supplier.address ?? '',
        city: supplier.city ?? '',
        country_code: supplier.country_code ?? 'SA',
        notes: supplier.notes ?? '',
        is_active: supplier.is_active,
    });

    const [confirmDelete, setConfirmDelete] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('suppliers.update', supplier.id));
    };

    const destroy = () => {
        router.delete(route('suppliers.destroy', supplier.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${supplier.name}`} />

            <PageHeader title="Edit supplier" description={supplier.name}>
                <DangerButton onClick={() => setConfirmDelete(true)}>Archive supplier</DangerButton>
            </PageHeader>

            <GlassCard className="max-w-3xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Name" required error={errors.name} htmlFor="name">
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                        </FormField>
                        <FormField label="Company name" error={errors.company_name} htmlFor="company_name">
                            <TextInput id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                        </FormField>
                        <FormField label="Contact person" error={errors.contact_person} htmlFor="contact_person">
                            <TextInput id="contact_person" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} />
                        </FormField>
                        <FormField label="Email" error={errors.email} htmlFor="email">
                            <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </FormField>
                        <FormField label="Phone" error={errors.phone} htmlFor="phone">
                            <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        </FormField>
                        <FormField label="Tax number" error={errors.tax_number} htmlFor="tax_number">
                            <TextInput id="tax_number" value={data.tax_number} onChange={(e) => setData('tax_number', e.target.value)} />
                        </FormField>
                        <FormField label="Commercial registration" error={errors.commercial_registration} htmlFor="commercial_registration">
                            <TextInput id="commercial_registration" value={data.commercial_registration} onChange={(e) => setData('commercial_registration', e.target.value)} />
                        </FormField>
                        <FormField label="City" error={errors.city} htmlFor="city">
                            <TextInput id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                        </FormField>
                    </div>

                    <FormField label="Address" error={errors.address} htmlFor="address">
                        <TextInput id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    </FormField>

                    <FormField label="Notes" error={errors.notes} htmlFor="notes">
                        <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </FormField>

                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40"
                        />
                        Supplier is active
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <GlassButton href={route('suppliers.show', supplier.id)} variant="secondary">Cancel</GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Save changes'}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={destroy}
                title="Archive this supplier?"
                message={`${supplier.name} will be archived. If it still has materials, deletion will be blocked.`}
                confirmLabel="Archive"
            />
        </AuthenticatedLayout>
    );
}
