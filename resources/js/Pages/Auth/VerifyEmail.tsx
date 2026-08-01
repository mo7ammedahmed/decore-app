import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useI18n } from '@/Utilities/i18n';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const { t } = useI18n();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.verify_title')} />

            <div className="mb-5 text-sm leading-relaxed text-white/50">
                {t('auth.verify_intro')}
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                    {t('auth.verify_sent')}
                </div>
            )}

            <form onSubmit={submit} className="flex items-center justify-between gap-4">
                <PrimaryButton disabled={processing}>
                    {processing ? t('auth.sending') : t('auth.resend')}
                </PrimaryButton>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                >
                    {t('common.log_out')}
                </Link>
            </form>
        </GuestLayout>
    );
}
