import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import { useI18n } from '@/Utilities/i18n';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ShopProfileSettings } from '@/types/domain';
import type { TranslationKey } from '@/Utilities/i18n';

const PLACEHOLDERS = ['{name}', '{email}', '{subject}', '{message}', '{shop_name}', '{shop_email}'];

const COLOR_FIELDS: {
    key:
        | 'theme_dark_accent'
        | 'theme_dark_background'
        | 'theme_dark_surface'
        | 'theme_dark_foreground'
        | 'theme_dark_muted'
        | 'theme_light_accent'
        | 'theme_light_background'
        | 'theme_light_surface'
        | 'theme_light_foreground'
        | 'theme_light_muted';
    labelKey: TranslationKey;
}[] = [
    { key: 'theme_dark_accent', labelKey: 'settings_profile.color_accent' },
    { key: 'theme_dark_background', labelKey: 'settings_profile.color_background' },
    { key: 'theme_dark_surface', labelKey: 'settings_profile.color_surface' },
    { key: 'theme_dark_foreground', labelKey: 'settings_profile.color_text' },
    { key: 'theme_dark_muted', labelKey: 'settings_profile.color_muted' },
    { key: 'theme_light_accent', labelKey: 'settings_profile.color_accent' },
    { key: 'theme_light_background', labelKey: 'settings_profile.color_background' },
    { key: 'theme_light_surface', labelKey: 'settings_profile.color_surface' },
    { key: 'theme_light_foreground', labelKey: 'settings_profile.color_text' },
    { key: 'theme_light_muted', labelKey: 'settings_profile.color_muted' },
];

export default function Profile({ settings }: { settings: ShopProfileSettings }) {
    const { t } = useI18n();
    const { data, setData, patch, processing, errors } = useForm({
        // ---- Identity ----
        shop_name: settings.shop_name,
        name_ar: settings.name_ar ?? '',
        role_en: settings.role_en ?? '',
        role_ar: settings.role_ar ?? '',
        short_pitch_en: settings.short_pitch_en ?? '',
        short_pitch_ar: settings.short_pitch_ar ?? '',
        bio_en: settings.bio_en ?? '',
        bio_ar: settings.bio_ar ?? '',
        // ---- Contact links ----
        email: settings.email ?? '',
        phone: settings.phone ?? '',
        location_en: settings.location_en ?? '',
        location_ar: settings.location_ar ?? '',
        website: settings.website ?? '',
        linkedin: settings.linkedin ?? '',
        github: settings.github ?? '',
        whatsapp: settings.whatsapp ?? '',
        resume_url: settings.resume_url ?? '',
        // ---- Portrait + publishing ----
        portrait: null as File | null,
        remove_portrait: false,
        is_published: settings.is_published,
        is_available: settings.is_available,
        // ---- Contact email delivery ----
        contact_notification_email: settings.contact_notification_email ?? '',
        contact_notification_subject_template: settings.contact_notification_subject_template,
        contact_notification_body_template: settings.contact_notification_body_template,
        contact_auto_reply_enabled: settings.contact_auto_reply_enabled,
        contact_auto_reply_subject_template: settings.contact_auto_reply_subject_template,
        contact_auto_reply_body_template: settings.contact_auto_reply_body_template,
        // ---- Palettes ----
        theme_dark_accent: settings.theme_dark_accent,
        theme_dark_background: settings.theme_dark_background,
        theme_dark_surface: settings.theme_dark_surface,
        theme_dark_foreground: settings.theme_dark_foreground,
        theme_dark_muted: settings.theme_dark_muted,
        theme_light_accent: settings.theme_light_accent,
        theme_light_background: settings.theme_light_background,
        theme_light_surface: settings.theme_light_surface,
        theme_light_foreground: settings.theme_light_foreground,
        theme_light_muted: settings.theme_light_muted,
        glass_effect_enabled: settings.glass_effect_enabled,
    });
    const [portraitPreview, setPortraitPreview] = useState<string | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('settings.profile.update'), { forceFormData: true, preserveScroll: true });
    };

    const onPortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('portrait', file);
        setData('remove_portrait', false);
        setPortraitPreview(file ? URL.createObjectURL(file) : null);
    };

    const removePortrait = () => {
        setData('portrait', null);
        setData('remove_portrait', true);
        setPortraitPreview(null);
    };

    const previewPortrait = portraitPreview ?? (data.remove_portrait ? null : settings.portrait_url);

    const insertPlaceholder = (field: 'contact_notification_body_template' | 'contact_auto_reply_body_template', placeholder: string) => {
        setData(field, `${data[field]}${placeholder}`);
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('settings_profile.title')} />

            <PageHeader
                title={t('settings_profile.title')}
                description={t('settings_profile.sub')}
            />

            <form onSubmit={submit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* ---- Identity ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{t('settings_profile.identity')}</h2>
                            <p className="mt-1 text-xs text-white/40">{t('settings_profile.identity_sub')}</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label={t('settings_profile.name_en')} required error={errors.shop_name} htmlFor="shop_name">
                                    <TextInput id="shop_name" value={data.shop_name} onChange={(e) => setData('shop_name', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.name_ar')} error={errors.name_ar} htmlFor="name_ar" className="[&_input]:text-right">
                                    <TextInput id="name_ar" dir="rtl" value={data.name_ar} onChange={(e) => setData('name_ar', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.role_en')} error={errors.role_en} htmlFor="role_en">
                                    <TextInput id="role_en" value={data.role_en} onChange={(e) => setData('role_en', e.target.value)} placeholder="Decoration materials atelier" />
                                </FormField>
                                <FormField label={t('settings_profile.role_ar')} error={errors.role_ar} htmlFor="role_ar" className="[&_input]:text-right">
                                    <TextInput id="role_ar" dir="rtl" value={data.role_ar} onChange={(e) => setData('role_ar', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.pitch_en')} error={errors.short_pitch_en} htmlFor="short_pitch_en">
                                    <Textarea id="short_pitch_en" rows={2} value={data.short_pitch_en} onChange={(e) => setData('short_pitch_en', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.pitch_ar')} error={errors.short_pitch_ar} htmlFor="short_pitch_ar" className="[&_textarea]:text-right">
                                    <Textarea id="short_pitch_ar" dir="rtl" rows={2} value={data.short_pitch_ar} onChange={(e) => setData('short_pitch_ar', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.bio_en')} error={errors.bio_en} htmlFor="bio_en">
                                    <Textarea id="bio_en" rows={5} value={data.bio_en} onChange={(e) => setData('bio_en', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.bio_ar')} error={errors.bio_ar} htmlFor="bio_ar" className="[&_textarea]:text-right">
                                    <Textarea id="bio_ar" dir="rtl" rows={5} value={data.bio_ar} onChange={(e) => setData('bio_ar', e.target.value)} />
                                </FormField>
                            </div>
                        </GlassCard>

                        {/* ---- Contact email delivery ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{t('settings_profile.contact_delivery')}</h2>
                            <p className="mt-1 text-xs text-white/40">{t('settings_profile.contact_delivery_sub')}</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label={t('settings_profile.inbox_email')} error={errors.contact_notification_email} htmlFor="contact_notification_email" hint={t('settings_profile.inbox_hint')}>
                                    <TextInput id="contact_notification_email" type="email" value={data.contact_notification_email} onChange={(e) => setData('contact_notification_email', e.target.value)} placeholder="you@example.com" />
                                </FormField>
                                <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
                                    <FormField label={t('settings_profile.owner_subject')} error={errors.contact_notification_subject_template} htmlFor="contact_notification_subject_template">
                                        <TextInput id="contact_notification_subject_template" value={data.contact_notification_subject_template} onChange={(e) => setData('contact_notification_subject_template', e.target.value)} />
                                    </FormField>
                                    <FormField label={t('settings_profile.auto_reply_subject')} error={errors.contact_auto_reply_subject_template} htmlFor="contact_auto_reply_subject_template">
                                        <TextInput id="contact_auto_reply_subject_template" value={data.contact_auto_reply_subject_template} onChange={(e) => setData('contact_auto_reply_subject_template', e.target.value)} />
                                    </FormField>
                                    <FormField label={t('settings_profile.owner_body')} error={errors.contact_notification_body_template} htmlFor="contact_notification_body_template">
                                        <Textarea id="contact_notification_body_template" rows={6} value={data.contact_notification_body_template} onChange={(e) => setData('contact_notification_body_template', e.target.value)} />
                                    </FormField>
                                    <FormField label={t('settings_profile.auto_reply_body')} error={errors.contact_auto_reply_body_template} htmlFor="contact_auto_reply_body_template">
                                        <Textarea id="contact_auto_reply_body_template" rows={6} value={data.contact_auto_reply_body_template} onChange={(e) => setData('contact_auto_reply_body_template', e.target.value)} />
                                    </FormField>
                                </div>
                            </div>

                            <label className="mt-5 flex items-center gap-3">
                                <Checkbox
                                    checked={data.contact_auto_reply_enabled}
                                    onChange={(e) => setData('contact_auto_reply_enabled', e.target.checked)}
                                />
                                <span className="text-sm text-white/80">{t('settings_profile.auto_reply_enabled')}</span>
                            </label>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-white/35">{t('settings_profile.placeholders')}</span>
                                {PLACEHOLDERS.map((ph) => (
                                    <button
                                        key={ph}
                                        type="button"
                                        onClick={() => insertPlaceholder('contact_notification_body_template', ph)}
                                        className="rounded-full border border-white/15 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-white/60 transition-colors hover:border-accent/50 hover:text-accent"
                                    >
                                        {ph}
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        {/* ---- Contact ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{t('settings_profile.contact')}</h2>
                            <p className="mt-1 text-xs text-white/40">{t('settings_profile.contact_sub')}</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label={t('common.email')} error={errors.email} htmlFor="email">
                                    <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.mobile')} error={errors.phone} htmlFor="phone" hint={t('settings_profile.mobile_hint')}>
                                    <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder={t('settings_profile.mobile_placeholder')} />
                                </FormField>
                                <FormField label={t('settings_profile.location_en')} error={errors.location_en} htmlFor="location_en">
                                    <TextInput id="location_en" value={data.location_en} onChange={(e) => setData('location_en', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.location_ar')} error={errors.location_ar} htmlFor="location_ar" className="[&_input]:text-right">
                                    <TextInput id="location_ar" dir="rtl" value={data.location_ar} onChange={(e) => setData('location_ar', e.target.value)} />
                                </FormField>
                                <FormField label={t('settings_profile.website')} error={errors.website} htmlFor="website">
                                    <TextInput id="website" type="url" value={data.website} onChange={(e) => setData('website', e.target.value)} placeholder="https://…" />
                                </FormField>
                                <FormField label={t('settings_profile.linkedin')} error={errors.linkedin} htmlFor="linkedin">
                                    <TextInput id="linkedin" type="url" value={data.linkedin} onChange={(e) => setData('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" />
                                </FormField>
                                <FormField label={t('settings_profile.github')} error={errors.github} htmlFor="github">
                                    <TextInput id="github" type="url" value={data.github} onChange={(e) => setData('github', e.target.value)} placeholder="https://github.com/…" />
                                </FormField>
                                <FormField label={t('settings_profile.whatsapp')} error={errors.whatsapp} htmlFor="whatsapp" hint={t('settings_profile.whatsapp_hint')}>
                                    <TextInput id="whatsapp" type="url" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} placeholder="https://wa.me/…" />
                                </FormField>
                                <FormField label={t('settings_profile.resume')} error={errors.resume_url} htmlFor="resume_url" className="sm:col-span-2">
                                    <TextInput id="resume_url" type="url" value={data.resume_url} onChange={(e) => setData('resume_url', e.target.value)} placeholder="https://drive.google.com/…" />
                                </FormField>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        {/* ---- Presentation ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{t('settings_profile.presentation')}</h2>
                            <p className="mt-1 text-xs text-white/40">{t('settings_profile.presentation_sub')}</p>
                            <div className="mt-5 flex flex-col gap-4">
                                <div className="shrink-0">
                                    <p className="form-label">{t('settings_profile.portrait')}</p>
                                    <div className="liquid-glass-strong flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl">
                                        {previewPortrait ? (
                                            <img src={previewPortrait} alt={t('settings_profile.portrait')} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="font-heading text-4xl italic text-accent">
                                                {(data.shop_name || 'D').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="inline-flex w-fit cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={onPortraitChange}
                                        />
                                        <span className="liquid-glass rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                                            {settings.portrait_url || portraitPreview ? t('settings_profile.replace_portrait') : t('settings_profile.upload_portrait')}
                                        </span>
                                    </label>
                                    {(settings.portrait_url || portraitPreview) && !data.remove_portrait && (
                                        <button
                                            type="button"
                                            onClick={removePortrait}
                                            className="w-fit text-xs font-medium text-white/40 transition-colors hover:text-danger"
                                        >
                                            {t('settings_profile.remove_portrait')}
                                        </button>
                                    )}
                                    {errors.portrait && <p className="field-error">{errors.portrait}</p>}
                                    <p className="text-xs text-white/35">{t('settings_profile.portrait_hint')}</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <label className="flex items-center gap-3">
                                    <Checkbox checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                                    <span className="text-sm text-white/80">{t('settings_profile.publish')}</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <Checkbox checked={data.is_available} onChange={(e) => setData('is_available', e.target.checked)} />
                                    <span className="text-sm text-white/80">{t('settings_profile.available')}</span>
                                </label>
                            </div>
                        </GlassCard>

                        {/* ---- Portfolio palettes ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{t('settings_profile.palettes')}</h2>
                            <p className="mt-1 text-xs text-white/40">{t('settings_profile.palettes_sub')}</p>

                            <label className="mt-5 flex items-center gap-3">
                                <Checkbox checked={data.glass_effect_enabled} onChange={(e) => setData('glass_effect_enabled', e.target.checked)} />
                                <span className="text-sm text-white/80">{t('settings_profile.glass_effect')}</span>
                            </label>

                            {(['dark', 'light'] as const).map((mode) => {
                                const isDark = mode === 'dark';
                                const modeName = isDark ? t('settings_profile.dark_mode') : t('settings_profile.light_mode');
                                const background = isDark ? data.theme_dark_background : data.theme_light_background;
                                const surface = isDark ? data.theme_dark_surface : data.theme_light_surface;
                                const foreground = isDark ? data.theme_dark_foreground : data.theme_light_foreground;
                                const muted = isDark ? data.theme_dark_muted : data.theme_light_muted;
                                const accent = isDark ? data.theme_dark_accent : data.theme_light_accent;

                                return (
                                    <fieldset key={mode} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                        <legend className="sr-only">{isDark ? t('settings_profile.palette_dark') : t('settings_profile.palette_light')}</legend>

                                        <div className="flex items-start gap-3 border-b border-white/10 pb-4">
                                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${isDark ? 'border-white/15 bg-[#090909] text-white' : 'border-white/15 bg-white text-black'}`}>
                                                {isDark ? <MoonIcon /> : <SunIcon />}
                                            </span>
                                            <div>
                                                <h3 className="font-heading text-xl italic text-white">{modeName}</h3>
                                                <p className="mt-1 text-sm leading-6 text-white/40">
                                                    {t('settings_profile.mode_colors', { mode: modeName })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                            {COLOR_FIELDS.filter((f) => f.key.startsWith(`theme_${mode}_`)).map((f) => {
                                                const label = t(f.labelKey);
                                                return (
                                                    <div key={f.key} className="block">
                                                        <span className="text-[11px] uppercase tracking-[0.12em] text-white/40">{label}</span>
                                                        <ThemeColorControl
                                                            value={data[f.key]}
                                                            onChange={(hex) => setData(f.key, hex)}
                                                            ariaLabel={label}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Live palette preview */}
                                        <div className="mt-5 rounded-xl border border-white/10 p-4" style={{ backgroundColor: background, color: foreground }}>
                                            <div className="flex min-h-28 items-end justify-between gap-5 rounded-lg p-4" style={{ backgroundColor: surface }}>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: muted }}>
                                                        {isDark ? t('settings_profile.dark_preview') : t('settings_profile.light_preview')}
                                                    </p>
                                                    <p className="mt-2 text-base font-semibold">{t('settings_profile.preview_line')}</p>
                                                    <span
                                                        className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
                                                        style={{ backgroundColor: accent, color: background }}
                                                    >
                                                        {data.shop_name || 'Decore'}
                                                    </span>
                                                </div>
                                                <span className="h-9 w-9 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                                            </div>
                                        </div>
                                    </fieldset>
                                );
                            })}
                            {COLOR_FIELDS.filter((f) => ['theme_dark_accent', 'theme_light_accent'].includes(f.key)).map((f) =>
                                errors[f.key] ? <p key={f.key} className="field-error">{errors[f.key]}</p> : null,
                            )}
                        </GlassCard>

                        <GlassCard className="p-6">
                            <PrimaryButton className="w-full" disabled={processing}>
                                {processing ? t('common.saving') : t('settings_profile.save')}
                            </PrimaryButton>
                        </GlassCard>
                    </div>
                </div>
            </form>

            <div className="mt-6">
                <GlassButton href={route('dashboard')} variant="secondary">{t('common.back_to_dashboard')}</GlassButton>
            </div>
        </AuthenticatedLayout>
    );
}

/* ---------------------------------------------------------------------------
 * Theme colour control — native picker + hex field (portfolio-2 reference)
 * ------------------------------------------------------------------------- */

function ThemeColorControl({
    value,
    onChange,
    ariaLabel,
}: {
    value: string;
    onChange: (value: string) => void;
    ariaLabel: string;
}) {
    const { t } = useI18n();

    return (
        <div className="mt-1.5 flex items-center gap-2">
            <input
                aria-label={t('settings_profile.picker_aria', { label: ariaLabel })}
                type="color"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-white/15 bg-white/[0.04] p-1"
            />
            <input
                aria-label={t('settings_profile.hex_aria', { label: ariaLabel })}
                type="text"
                value={value}
                maxLength={7}
                spellCheck={false}
                onChange={(event) => onChange(event.target.value)}
                className="form-input w-full font-mono text-xs uppercase"
            />
        </div>
    );
}

function MoonIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4l1.4-1.4" />
        </svg>
    );
}
