import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useI18n } from '@/Utilities/i18n';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const { t } = useI18n();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.sign_in')} />

            {status && (
                <div className="mb-4 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value={t('auth.email')} />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between gap-2">
                        <InputLabel htmlFor="password" value={t('auth.password')} />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-accent transition-colors hover:text-white"
                            >
                                {t('auth.forgot')}
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex items-center gap-3 text-sm text-white/70">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    {t('auth.remember_me')}
                </label>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? t('auth.signing_in') : t('auth.sign_in')}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-xs text-white/35">
                {t('auth.dev_accounts')}
            </p>
        </GuestLayout>
    );
}
