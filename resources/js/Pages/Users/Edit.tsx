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
import type { Role, Supplier, User } from '@/types/domain';
import { useState } from 'react';

interface EditProps {
    user: User;
    roleOptions: Record<string, string>;
    suppliers: Pick<Supplier, 'id' | 'name'>[];
}

export default function Edit({ user, roleOptions, suppliers }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        password: '',
        password_confirmation: '',
        role: user.role,
        supplier_id: user.supplier_id ? String(user.supplier_id) : '',
        is_active: user.is_active,
    });

    const [showSupplier, setShowSupplier] = useState(data.role === 'supplier');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${user.name}`} />

            <PageHeader title="Edit user" description={`Updating ${user.name} — only admins may assign roles.`} />

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
                        <FormField label="New password" error={errors.password} hint="Leave blank to keep the current password." htmlFor="password">
                            <TextInput id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" />
                        </FormField>
                        <FormField label="Confirm new password" error={errors.password_confirmation} htmlFor="password_confirmation">
                            <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                        </FormField>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Role" required error={errors.role} htmlFor="role">
                            <SelectInput
                                id="role"
                                value={data.role}
                                onChange={(e) => {
                                    setData('role', e.target.value as Role);
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

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <GlassButton href={route('users.show', user.id)} variant="secondary">
                            Cancel
                        </GlassButton>
                        <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Save changes'}</PrimaryButton>
                    </div>
                </form>
            </GlassCard>
        </AuthenticatedLayout>
    );
}
