import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, router, useForm } from '@inertiajs/react';
import { useI18n } from '@/Utilities/i18n';
import type { TrackingPlatformInfo } from '@/types/domain';
import { useState } from 'react';

interface IntegrationsProps {
    platforms: TrackingPlatformInfo[];
    siteUrl: string;
}

const CATEGORY_ORDER = ['Google', 'Advertising pixels', 'Behavior analytics'];

export default function IntegrationsIndex({ platforms, siteUrl }: IntegrationsProps) {
    const { t } = useI18n();
    const [disconnecting, setDisconnecting] = useState<TrackingPlatformInfo | null>(null);
    const [showCustom, setShowCustom] = useState<Record<string, boolean>>({});

    const categories = CATEGORY_ORDER.filter((category) => platforms.some((p) => p.category === category));

    return (
        <AuthenticatedLayout>
            <Head title={t('integrations.title')} />

            <PageHeader title={t('integrations.title')} description={t('integrations.sub')} />

            <div className="mb-6 flex items-center gap-3 text-xs text-white/40">
                <span className="uppercase tracking-[0.18em]">{t('integrations.site_url')}</span>
                <code className="rounded-full bg-white/[0.05] px-3 py-1 text-white/70">{siteUrl}</code>
            </div>

            <div className="space-y-8">
                {categories.map((category) => (
                    <section key={category}>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">{category}</h2>
                        <div className="mt-4 space-y-4">
                            {platforms
                                .filter((p) => p.category === category)
                                .map((platform) => (
                                    <IntegrationCard
                                        key={platform.key}
                                        platform={platform}
                                        showCustom={showCustom[platform.key] === true || platform.installation_method === 'custom'}
                                        onToggleCustom={(custom) =>
                                            setShowCustom((prev) => ({ ...prev, [platform.key]: custom }))
                                        }
                                        onDisconnect={() => setDisconnecting(platform)}
                                    />
                                ))}
                        </div>
                    </section>
                ))}
            </div>

            <ConfirmDialog
                open={disconnecting !== null}
                onClose={() => setDisconnecting(null)}
                onConfirm={() => {
                    if (disconnecting) router.delete(route('integrations.destroy', disconnecting.key));
                    setDisconnecting(null);
                }}
                title={t('integrations.disconnect_confirm')}
                message={disconnecting?.label ?? ''}
                confirmLabel={t('integrations.disconnect')}
            />
        </AuthenticatedLayout>
    );
}

function IntegrationCard({
    platform,
    showCustom,
    onToggleCustom,
    onDisconnect,
}: {
    platform: TrackingPlatformInfo;
    showCustom: boolean;
    onToggleCustom: (custom: boolean) => void;
    onDisconnect: () => void;
}) {
    const { t } = useI18n();
    const { data, setData, put, processing, errors, reset } = useForm({
        tracking_id: platform.tracking_id ?? '',
        installation_method: platform.installation_method ?? 'managed',
        head_code: platform.head_code ?? '',
        body_code: platform.body_code ?? '',
        is_enabled: platform.is_enabled ?? false,
    });

    const installationMethod = data.installation_method;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('integrations.update', platform.key), {
            onSuccess: () => reset(),
        });
    };

    return (
        <GlassCard className="p-6">
            <div className="flex items-start gap-4">
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ backgroundColor: `${platform.brand_color}22`, color: platform.brand_color }}
                    aria-hidden="true"
                >
                    {platform.monogram}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg italic text-white">{platform.label}</h3>
                        {platform.is_configured && (
                            <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-medium text-success">
                                {t('integrations.enabled')}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-white/45">{platform.description}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/30">
                        {t('integrations.placement', { placement: platform.placement })}
                    </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <a
                        href={platform.documentation_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-white/50 transition-colors hover:text-white"
                    >
                        {t('integrations.docs')} ↗
                    </a>
                    {platform.diagnostics_url && (
                        <a
                            href={platform.diagnostics_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-white/50 transition-colors hover:text-white"
                        >
                            {t('integrations.diagnostics')} ↗
                        </a>
                    )}
                    {platform.is_configured && (
                        <button
                            type="button"
                            onClick={onDisconnect}
                            className="text-xs font-medium text-danger/80 transition-colors hover:text-danger"
                        >
                            {t('integrations.disconnect')}
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4 border-t border-white/[0.06] pt-5">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onToggleCustom(false);
                                setData('installation_method', 'managed');
                            }}
                            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                installationMethod === 'managed' ? 'liquid-glass-strong text-white' : 'text-white/45 hover:text-white'
                            }`}
                        >
                            {t('integrations.managed')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onToggleCustom(true);
                                setData('installation_method', 'custom');
                            }}
                            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                installationMethod === 'custom' ? 'liquid-glass-strong text-white' : 'text-white/45 hover:text-white'
                            }`}
                        >
                            {t('integrations.custom')}
                        </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                            type="checkbox"
                            checked={data.is_enabled}
                            onChange={(e) => setData('is_enabled', e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/40"
                        />
                        {t('integrations.enabled')}
                    </label>
                </div>

                {installationMethod === 'managed' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor={`${platform.key}-id`} className="form-label">
                                {platform.id_label}
                            </label>
                            <input
                                id={`${platform.key}-id`}
                                dir="ltr"
                                className="form-input"
                                value={data.tracking_id}
                                onChange={(e) => setData('tracking_id', e.target.value)}
                                placeholder={platform.placeholder}
                            />
                            <p className="mt-1.5 text-xs text-white/35">{t('integrations.managed_hint')}</p>
                            {errors.tracking_id && <p className="field-error">{errors.tracking_id}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                            <label htmlFor={`${platform.key}-head`} className="form-label">
                                {t('integrations.head_code')}
                            </label>
                            <textarea
                                id={`${platform.key}-head`}
                                dir="ltr"
                                rows={5}
                                className="form-textarea font-mono text-xs"
                                value={data.head_code}
                                onChange={(e) => setData('head_code', e.target.value)}
                                placeholder={`<script>…</script>`}
                            />
                            <p className="mt-1.5 text-xs text-white/35">{t('integrations.custom_hint')}</p>
                            {errors.head_code && <p className="field-error">{errors.head_code}</p>}
                        </div>
                        {platform.has_body_fallback && (
                            <div>
                                <label htmlFor={`${platform.key}-body`} className="form-label">
                                    {t('integrations.body_code')}
                                </label>
                                <textarea
                                    id={`${platform.key}-body`}
                                    dir="ltr"
                                    rows={5}
                                    className="form-textarea font-mono text-xs"
                                    value={data.body_code}
                                    onChange={(e) => setData('body_code', e.target.value)}
                                    placeholder="<noscript>…</noscript>"
                                />
                                {errors.body_code && <p className="field-error">{errors.body_code}</p>}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3">
                    {showCustom && installationMethod === 'custom' && !data.is_enabled && (
                        <p className="mr-auto text-xs text-white/35">{t('integrations.custom_hint')}</p>
                    )}
                    <PrimaryButton disabled={processing}>{t('integrations.save')}</PrimaryButton>
                </div>
            </form>
        </GlassCard>
    );
}
