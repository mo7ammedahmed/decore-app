import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ShopProfileSettings } from '@/types/domain';

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
    label: string;
}[] = [
    { key: 'theme_dark_accent', label: 'Accent' },
    { key: 'theme_dark_background', label: 'Background' },
    { key: 'theme_dark_surface', label: 'Surface' },
    { key: 'theme_dark_foreground', label: 'Text' },
    { key: 'theme_dark_muted', label: 'Muted text' },
    { key: 'theme_light_accent', label: 'Accent' },
    { key: 'theme_light_background', label: 'Background' },
    { key: 'theme_light_surface', label: 'Surface' },
    { key: 'theme_light_foreground', label: 'Text' },
    { key: 'theme_light_muted', label: 'Muted text' },
];

export default function Profile({ settings }: { settings: ShopProfileSettings }) {
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
            <Head title="Profile" />

            <PageHeader
                title="Profile"
                description="The positioning, biography, and contact details shown across your public site, plus the theme palettes that colour it."
            />

            <form onSubmit={submit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* ---- Identity ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Identity</h2>
                            <p className="mt-1 text-xs text-white/40">Use a clear role and concise value proposition in both languages.</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label="Name - English" required error={errors.shop_name} htmlFor="shop_name">
                                    <TextInput id="shop_name" value={data.shop_name} onChange={(e) => setData('shop_name', e.target.value)} />
                                </FormField>
                                <FormField label="الاسم - العربية" error={errors.name_ar} htmlFor="name_ar" className="[&_input]:text-right">
                                    <TextInput id="name_ar" dir="rtl" value={data.name_ar} onChange={(e) => setData('name_ar', e.target.value)} />
                                </FormField>
                                <FormField label="Role - English" error={errors.role_en} htmlFor="role_en">
                                    <TextInput id="role_en" value={data.role_en} onChange={(e) => setData('role_en', e.target.value)} placeholder="Decoration materials atelier" />
                                </FormField>
                                <FormField label="الدور - العربية" error={errors.role_ar} htmlFor="role_ar" className="[&_input]:text-right">
                                    <TextInput id="role_ar" dir="rtl" value={data.role_ar} onChange={(e) => setData('role_ar', e.target.value)} />
                                </FormField>
                                <FormField label="Short pitch - English" error={errors.short_pitch_en} htmlFor="short_pitch_en">
                                    <Textarea id="short_pitch_en" rows={2} value={data.short_pitch_en} onChange={(e) => setData('short_pitch_en', e.target.value)} />
                                </FormField>
                                <FormField label="نبذة مختصرة - العربية" error={errors.short_pitch_ar} htmlFor="short_pitch_ar" className="[&_textarea]:text-right">
                                    <Textarea id="short_pitch_ar" dir="rtl" rows={2} value={data.short_pitch_ar} onChange={(e) => setData('short_pitch_ar', e.target.value)} />
                                </FormField>
                                <FormField label="Biography - English" error={errors.bio_en} htmlFor="bio_en">
                                    <Textarea id="bio_en" rows={5} value={data.bio_en} onChange={(e) => setData('bio_en', e.target.value)} />
                                </FormField>
                                <FormField label="السيرة - العربية" error={errors.bio_ar} htmlFor="bio_ar" className="[&_textarea]:text-right">
                                    <Textarea id="bio_ar" dir="rtl" rows={5} value={data.bio_ar} onChange={(e) => setData('bio_ar', e.target.value)} />
                                </FormField>
                            </div>
                        </GlassCard>

                        {/* ---- Contact email delivery ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Contact email delivery</h2>
                            <p className="mt-1 text-xs text-white/40">Choose where enquiries are delivered and personalise both email templates.</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label="Inbox email" error={errors.contact_notification_email} htmlFor="contact_notification_email" hint="Leave blank to use your public profile email.">
                                    <TextInput id="contact_notification_email" type="email" value={data.contact_notification_email} onChange={(e) => setData('contact_notification_email', e.target.value)} placeholder="you@example.com" />
                                </FormField>
                                <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
                                    <FormField label="Owner notification subject" error={errors.contact_notification_subject_template} htmlFor="contact_notification_subject_template">
                                        <TextInput id="contact_notification_subject_template" value={data.contact_notification_subject_template} onChange={(e) => setData('contact_notification_subject_template', e.target.value)} />
                                    </FormField>
                                    <FormField label="Auto-reply subject" error={errors.contact_auto_reply_subject_template} htmlFor="contact_auto_reply_subject_template">
                                        <TextInput id="contact_auto_reply_subject_template" value={data.contact_auto_reply_subject_template} onChange={(e) => setData('contact_auto_reply_subject_template', e.target.value)} />
                                    </FormField>
                                    <FormField label="Owner notification body" error={errors.contact_notification_body_template} htmlFor="contact_notification_body_template">
                                        <Textarea id="contact_notification_body_template" rows={6} value={data.contact_notification_body_template} onChange={(e) => setData('contact_notification_body_template', e.target.value)} />
                                    </FormField>
                                    <FormField label="Auto-reply body" error={errors.contact_auto_reply_body_template} htmlFor="contact_auto_reply_body_template">
                                        <Textarea id="contact_auto_reply_body_template" rows={6} value={data.contact_auto_reply_body_template} onChange={(e) => setData('contact_auto_reply_body_template', e.target.value)} />
                                    </FormField>
                                </div>
                            </div>

                            <label className="mt-5 flex items-center gap-3">
                                <Checkbox
                                    checked={data.contact_auto_reply_enabled}
                                    onChange={(e) => setData('contact_auto_reply_enabled', e.target.checked)}
                                />
                                <span className="text-sm text-white/80">Send an automatic reply to visitors</span>
                            </label>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-white/35">Available placeholders:</span>
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
                            <h2 className="font-heading text-xl italic text-white">Contact</h2>
                            <p className="mt-1 text-xs text-white/40">Public ways for people to find and reach you.</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label="Email" error={errors.email} htmlFor="email">
                                    <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </FormField>
                                <FormField label="Mobile" error={errors.phone} htmlFor="phone">
                                    <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+966 5x xxx xxxx" />
                                </FormField>
                                <FormField label="Location - English" error={errors.location_en} htmlFor="location_en">
                                    <TextInput id="location_en" value={data.location_en} onChange={(e) => setData('location_en', e.target.value)} />
                                </FormField>
                                <FormField label="الموقع - العربية" error={errors.location_ar} htmlFor="location_ar" className="[&_input]:text-right">
                                    <TextInput id="location_ar" dir="rtl" value={data.location_ar} onChange={(e) => setData('location_ar', e.target.value)} />
                                </FormField>
                                <FormField label="Website" error={errors.website} htmlFor="website">
                                    <TextInput id="website" type="url" value={data.website} onChange={(e) => setData('website', e.target.value)} placeholder="https://…" />
                                </FormField>
                                <FormField label="LinkedIn" error={errors.linkedin} htmlFor="linkedin">
                                    <TextInput id="linkedin" type="url" value={data.linkedin} onChange={(e) => setData('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" />
                                </FormField>
                                <FormField label="GitHub" error={errors.github} htmlFor="github">
                                    <TextInput id="github" type="url" value={data.github} onChange={(e) => setData('github', e.target.value)} placeholder="https://github.com/…" />
                                </FormField>
                                <FormField label="WhatsApp" error={errors.whatsapp} htmlFor="whatsapp">
                                    <TextInput id="whatsapp" type="url" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} placeholder="https://wa.me/…" />
                                </FormField>
                                <FormField label="Resume URL" error={errors.resume_url} htmlFor="resume_url" className="sm:col-span-2">
                                    <TextInput id="resume_url" type="url" value={data.resume_url} onChange={(e) => setData('resume_url', e.target.value)} placeholder="https://drive.google.com/…" />
                                </FormField>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        {/* ---- Presentation ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Presentation</h2>
                            <p className="mt-1 text-xs text-white/40">Control your portrait and publishing status.</p>
                            <div className="mt-5 flex flex-col gap-4">
                                <div className="shrink-0">
                                    <p className="form-label">Portrait</p>
                                    <div className="liquid-glass-strong flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl">
                                        {previewPortrait ? (
                                            <img src={previewPortrait} alt="Portrait" className="h-full w-full object-cover" />
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
                                            {settings.portrait_url || portraitPreview ? 'Replace portrait' : 'Upload portrait'}
                                        </span>
                                    </label>
                                    {(settings.portrait_url || portraitPreview) && !data.remove_portrait && (
                                        <button
                                            type="button"
                                            onClick={removePortrait}
                                            className="w-fit text-xs font-medium text-white/40 transition-colors hover:text-danger"
                                        >
                                            Remove portrait
                                        </button>
                                    )}
                                    {errors.portrait && <p className="field-error">{errors.portrait}</p>}
                                    <p className="text-xs text-white/35">JPG, PNG, or WebP · up to 4 MB</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <label className="flex items-center gap-3">
                                    <Checkbox checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                                    <span className="text-sm text-white/80">Publish profile</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <Checkbox checked={data.is_available} onChange={(e) => setData('is_available', e.target.checked)} />
                                    <span className="text-sm text-white/80">Available for work</span>
                                </label>
                            </div>
                        </GlassCard>

                        {/* ---- Portfolio palettes ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Portfolio palettes</h2>
                            <p className="mt-1 text-xs text-white/40">Colours used by the public site. The dark palette drives the visitor site; light is stored for future light-mode support.</p>

                            <label className="mt-5 flex items-center gap-3">
                                <Checkbox checked={data.glass_effect_enabled} onChange={(e) => setData('glass_effect_enabled', e.target.checked)} />
                                <span className="text-sm text-white/80">Enable the glass surface effect across the public site</span>
                            </label>

                            {(['dark', 'light'] as const).map((mode) => (
                                <div key={mode} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                    <p className="text-sm font-semibold text-white/85">
                                        {mode === 'dark' ? 'Dark mode' : 'Light mode'}
                                    </p>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        {COLOR_FIELDS.filter((f) => f.key.startsWith(`theme_${mode}_`)).map((f) => (
                                            <label key={f.key} className="block">
                                                <span className="text-[11px] uppercase tracking-[0.12em] text-white/40">{f.label}</span>
                                                <span className="mt-1.5 flex items-center gap-2">
                                                    <span
                                                        className="inline-block h-7 w-7 shrink-0 rounded-full border border-white/20"
                                                        style={{ backgroundColor: data[f.key] }}
                                                    />
                                                    <TextInput
                                                        value={data[f.key]}
                                                        onChange={(e) => setData(f.key, e.target.value)}
                                                        className="font-mono text-xs"
                                                        aria-label={`${f.label} (${mode})`}
                                                    />
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Live palette preview */}
                                    <div
                                        className="mt-5 overflow-hidden rounded-xl border border-white/10 p-4"
                                        style={{
                                            backgroundColor: mode === 'dark' ? data.theme_dark_background : data.theme_light_background,
                                            color: mode === 'dark' ? data.theme_dark_foreground : data.theme_light_foreground,
                                        }}
                                    >
                                        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: mode === 'dark' ? data.theme_dark_muted : data.theme_light_muted }}>
                                            {mode === 'dark' ? 'Dark preview' : 'Light preview'}
                                        </p>
                                        <p className="mt-2 text-sm">
                                            Your shop, your atmosphere.
                                        </p>
                                        <span
                                            className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
                                            style={{
                                                backgroundColor: mode === 'dark' ? data.theme_dark_accent : data.theme_light_accent,
                                                color: mode === 'dark' ? data.theme_dark_background : data.theme_light_background,
                                            }}
                                        >
                                            {data.shop_name || 'Decore'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {COLOR_FIELDS.filter((f) => ['theme_dark_accent', 'theme_light_accent'].includes(f.key)).map((f) =>
                                errors[f.key] ? <p key={f.key} className="field-error">{errors[f.key]}</p> : null,
                            )}
                        </GlassCard>

                        <GlassCard className="p-6">
                            <PrimaryButton className="w-full" disabled={processing}>
                                {processing ? 'Saving…' : 'Save profile'}
                            </PrimaryButton>
                        </GlassCard>
                    </div>
                </div>
            </form>

            <div className="mt-6">
                <GlassButton href={route('dashboard')} variant="secondary">Back to dashboard</GlassButton>
            </div>
        </AuthenticatedLayout>
    );
}
