import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import type { Supplier } from '@/types/domain';
import { useState } from 'react';

interface CreateProps {
    roleOptions: Record<string, string>;
    suppliers: Pick<Supplier, 'id' | 'name'>[];
}

export default function Create({ roleOptions, suppliers }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'sales_staff',
        supplier_id: '',
        is_active: true,
    });

    const [showSupplier, setShowSupplier] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New user" />

            <PageHeader title="New user" description="Create an account and assign a role." />

            <GlassCard className="max-w-2xl p-8">
                <form onSubmit={submit} className="space-y-5">
                    <FormField label="Full name" required error={errors.name} htmlFor="name">
                        <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                    </FormField>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Email" required error={errors.email} htmlFor="email">
                            <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                        </FormField>
                        <FormField label="Phone" error={errors.phone} htmlFor="phone">
                            <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="05xxxxxxxx" />
                        </FormField>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Password" required error={errors.password} htmlFor="password">
                            <TextInput id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required autoComplete="new-password" />
                        </FormField>
                        <FormField label="Confirm password" required error={errors.password_confirmation} htmlFor="password_confirmation">
                            <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required autoComplete="new-password" />
                        </FormField>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Role" required error={errors.role} htmlFor="role">
                            <SelectInput
                                id="role"
                                value={data.role}
                                onChange={(e) => {
                                    setData('role', e.target.value);
                                    setShowSupplier(e.target.value === 'supplier');
                                }}
                                options={roleOptions}
                            />
                        </FormField>

                        {showSupplier && (
                            <FormField label="Supplier" required error={errors.supplier_id} htmlFor="supplier_id">
                                <SelectInput
                                    id="supplier_id"
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                                    placeholder="Select a supplier"
                                />
                            </FormField>
                        )}
                    </div>

                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40"
                        />
                        Account is active
                    </label>

                    {errors.is_active && <InputError>{errors.is_active}</InputError>}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <GlassButton href={route('users.index')} variant="secondary">
                            Cancel
                        </GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? 'Creating…' : 'Create user'}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
