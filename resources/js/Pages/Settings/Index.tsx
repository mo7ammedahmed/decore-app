import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';
import InvoiceDocument, { type InvoiceDocumentInvoice } from '@/Components/InvoiceDocument';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { BilingualCard, InvoiceTemplate, ShopSettings } from '@/types/domain';

const ACCENTS = ['#8a6d3b', '#0f766e', '#1d4ed8', '#7c3aed', '#be123c', '#334155'];

const TEMPLATES: { id: InvoiceTemplate; name: string; description: string }[] = [
    { id: 'classic', name: 'Classic', description: 'Serif brand, neutral paper look' },
    { id: 'modern', name: 'Modern', description: 'Accent header band, bold totals' },
    { id: 'minimal', name: 'Minimal', description: 'Quiet and clean, centred brand' },
];

const MOCK_INVOICE: InvoiceDocumentInvoice = {
    invoice_number: 'INV-2026-000123',
    issue_date: '2026-08-01',
    due_date: '2026-08-15',
    status: 'draft',
    payment_status: 'unpaid',
    currency_code: 'SAR',
    customer: { name: 'Abdullah Saleh', company_name: 'Studio Al Noor' },
    items: [
        { id: 1, description: 'Walnut Veneer Panel', quantity: '4', unit: 'sheet', unit_price: '85.00', tax_rate: '15', line_total: '391.00' },
        { id: 2, description: 'Carrara Marble Sheet', quantity: '2', unit: 'sheet', unit_price: '240.00', tax_rate: '15', line_total: '552.00' },
    ],
    subtotal: '820.00',
    discount_total: '0.00',
    tax_total: '123.00',
    total: '943.00',
    paid_total: '0.00',
    balance_due: '943.00',
    base_currency_code: 'SAR',
};

const LANDING_SECTIONS: { key: string; title: string; hint: string }[] = [
    { key: 'collections', title: 'Shop by collection', hint: 'The category tiles' },
    { key: 'featured', title: 'Featured finishes', hint: 'The curated material cards' },
    { key: 'inspiration', title: 'Project inspiration', hint: 'The editorial image mosaic' },
    { key: 'why', title: 'Why Decore', hint: 'The six benefit cards' },
    { key: 'journey', title: 'Customer journey', hint: 'The four-step process' },
    { key: 'cta', title: 'Final call to action', hint: 'The closing image banner' },
];

export default function Index({
    settings,
    materials,
    gallery_images,
}: {
    settings: ShopSettings;
    materials: { id: number; name_en: string; name_ar: string | null; sku: string }[];
    gallery_images: { id: number; image_url: string | null; alt_text: string | null; section_name: string }[];
}) {
    const { data, setData, patch, processing, errors } = useForm({
        shop_name: settings.shop_name,
        tagline: settings.tagline ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        address: settings.address ?? '',
        city: settings.city ?? '',
        country_code: settings.country_code ?? '',
        tax_number: settings.tax_number ?? '',
        commercial_registration: settings.commercial_registration ?? '',
        invoice_template: settings.invoice_template,
        invoice_accent: settings.invoice_accent,
        invoice_footer_note: settings.invoice_footer_note ?? '',
        invoice_thank_you: settings.invoice_thank_you ?? '',
        logo: null as File | null,
        remove_logo: false,
        landing_sections: settings.landing_sections ?? {},
        featured_material_ids: settings.featured_material_ids ?? [],
        hero_image_id: settings.hero_image_id ?? null,
        cta_image_id: settings.cta_image_id ?? null,
        why_cards: settings.why_cards ?? [],
        journey_steps: settings.journey_steps ?? [],
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('settings.update'), { forceFormData: true, preserveScroll: true });
    };

    const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('logo', file);
        setData('remove_logo', false);
        setLogoPreview(file ? URL.createObjectURL(file) : null);
    };

    const removeLogo = () => {
        setData('logo', null);
        setData('remove_logo', true);
        setLogoPreview(null);
    };

    const previewLogo = logoPreview ?? (data.remove_logo ? null : settings.logo_url);
    const accent = data.invoice_accent || '#8a6d3b';

    return (
        <AuthenticatedLayout>
            <Head title="Shop settings" />

            <PageHeader
                title="Shop settings"
                description="Your brand identity and the printable invoice template — every page and printed invoice reflects these details."
            />

            <form onSubmit={submit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* ---- Shop identity ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Shop identity</h2>
                            <div className="mt-5 flex flex-col gap-6 sm:flex-row">
                                <div className="shrink-0">
                                    <p className="form-label">Logo</p>
                                    <div className="liquid-glass-strong flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl">
                                        {previewLogo ? (
                                            <img src={previewLogo} alt="Shop logo preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="font-heading text-3xl italic text-accent" aria-hidden="true">
                                                {(data.shop_name || 'D').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end gap-2">
                                    <label className="inline-flex w-fit cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={onLogoChange}
                                        />
                                        <span className="liquid-glass rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                                            {settings.logo_url || logoPreview ? 'Replace shop logo' : 'Upload shop logo'}
                                        </span>
                                    </label>
                                    {(settings.logo_url || logoPreview) && !data.remove_logo && (
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="w-fit text-xs font-medium text-white/40 transition-colors hover:text-danger"
                                            aria-label="Remove shop logo">
                                            Remove logo
                                        </button>
                                    )}
                                    {errors.logo && <p className="field-error">{errors.logo}</p>}
                                    <p className="text-xs text-white/35">JPEG, PNG or WebP · up to 2 MB</p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <FormField label="Shop name" required error={errors.shop_name} htmlFor="shop_name">
                                    <TextInput id="shop_name" value={data.shop_name} onChange={(e) => setData('shop_name', e.target.value)} />
                                </FormField>
                                <FormField label="Tagline" error={errors.tagline} htmlFor="tagline">
                                    <TextInput id="tagline" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} placeholder="Decoration materials atelier" />
                                </FormField>
                            </div>
                        </GlassCard>

                        {/* ---- Contact details ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Contact details</h2>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label="Phone" error={errors.phone} htmlFor="phone">
                                    <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="05xxxxxxxx" />
                                </FormField>
                                <FormField label="Email" error={errors.email} htmlFor="email">
                                    <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </FormField>
                                <FormField label="Address" error={errors.address} htmlFor="address">
                                    <TextInput id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                </FormField>
                                <div className="grid grid-cols-2 gap-5">
                                    <FormField label="City" error={errors.city} htmlFor="city">
                                        <TextInput id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                    </FormField>
                                    <FormField label="Country code" error={errors.country_code} htmlFor="country_code">
                                        <TextInput id="country_code" value={data.country_code} onChange={(e) => setData('country_code', e.target.value.toUpperCase())} maxLength={2} placeholder="SA" />
                                    </FormField>
                                </div>
                            </div>
                        </GlassCard>

                        {/* ---- Legal / tax ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Legal & tax</h2>
                            <p className="mt-1 text-xs text-white/40">Shown on printed invoices.</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <FormField label="Tax number (VAT)" error={errors.tax_number} htmlFor="tax_number">
                                    <TextInput id="tax_number" value={data.tax_number} onChange={(e) => setData('tax_number', e.target.value)} />
                                </FormField>
                                <FormField label="Commercial registration" error={errors.commercial_registration} htmlFor="commercial_registration">
                                    <TextInput id="commercial_registration" value={data.commercial_registration} onChange={(e) => setData('commercial_registration', e.target.value)} />
                                </FormField>
                            </div>
                        </GlassCard>

                        {/* ---- Landing page structure ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Landing page</h2>
                            <p className="mt-1 text-xs text-white/40">Choose which sections visitors see and which finishes are featured.</p>

                            <p className="form-label mt-6">Sections</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {LANDING_SECTIONS.map(({ key, title, hint }) => (
                                    <label
                                        key={key}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 ${
                                            data.landing_sections[key] === false
                                                ? 'border-white/10 bg-white/[0.02] opacity-60'
                                                : 'border-accent/40 bg-accent/[0.06]'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.landing_sections[key] !== false}
                                            onChange={(e) =>
                                                setData('landing_sections', {
                                                    ...data.landing_sections,
                                                    [key]: e.target.checked,
                                                })
                                            }
                                            className="mt-0.5 accent-[#8a6d3b]"
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold text-white/85">{title}</span>
                                            <span className="block text-xs text-white/40">{hint}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.landing_sections && <p className="field-error">{errors.landing_sections}</p>}

                            <p className="form-label mt-6">Featured finishes</p>
                            <p className="text-xs text-white/40">Pick the materials shown in the featured section. Empty = newest active finishes automatically.</p>
                            {materials.length === 0 ? (
                                <p className="mt-3 text-sm text-white/40">No active materials yet.</p>
                            ) : (
                                <div className="mt-3 grid max-h-64 gap-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-2">
                                    {materials.map((material) => {
                                        const selected = data.featured_material_ids.includes(material.id);
                                        return (
                                            <label
                                                key={material.id}
                                                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                                                    selected ? 'bg-accent/10 text-white' : 'text-white/60 hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() =>
                                                        setData(
                                                            'featured_material_ids',
                                                            selected
                                                                ? data.featured_material_ids.filter((id) => id !== material.id)
                                                                : [...data.featured_material_ids, material.id],
                                                        )
                                                    }
                                                    className="accent-[#8a6d3b]"
                                                />
                                                <span className="truncate">{material.name_en}</span>
                                                <span className="ms-auto shrink-0 text-[10px] uppercase tracking-wider text-white/35">{material.sku}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {errors.featured_material_ids && <p className="field-error">{errors.featured_material_ids}</p>}

                            <p className="form-label mt-8">Why Decore — cards</p>
                            <p className="text-xs text-white/40">The benefit cards under the "Why Decore" heading. Add, reorder or remove cards; empty = the built-in six cards.</p>
                            <BilingualListEditor
                                items={data.why_cards}
                                onChange={(items) => setData('why_cards', items)}
                                itemNoun="card"
                                error={errors.why_cards}
                            />

                            <p className="form-label mt-8">Customer journey — steps</p>
                            <p className="text-xs text-white/40">The numbered process steps. Add, reorder or remove steps; empty = the built-in four steps.</p>
                            <BilingualListEditor
                                items={data.journey_steps}
                                onChange={(items) => setData('journey_steps', items)}
                                itemNoun="step"
                                error={errors.journey_steps}
                            />

                            <div className="mt-6 grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="hero_image" className="form-label">Hero image</label>
                                    <p className="text-xs text-white/40">The large landing hero photo. Empty = newest published image.</p>
                                    <select
                                        id="hero_image"
                                        className="form-input mt-2 w-full"
                                        value={data.hero_image_id ?? ''}
                                        onChange={(e) => setData('hero_image_id', e.target.value === '' ? null : Number(e.target.value))}
                                    >
                                        <option value="">Automatic (newest image)</option>
                                        {gallery_images.map((image) => (
                                            <option key={image.id} value={image.id}>
                                                {image.alt_text ? `${image.alt_text} · ${image.section_name}` : image.section_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.hero_image_id && <p className="field-error">{errors.hero_image_id}</p>}
                                </div>
                                <div>
                                    <label htmlFor="cta_image" className="form-label">Final CTA background</label>
                                    <p className="text-xs text-white/40">The closing banner photo. Empty = automatic.</p>
                                    <select
                                        id="cta_image"
                                        className="form-input mt-2 w-full"
                                        value={data.cta_image_id ?? ''}
                                        onChange={(e) => setData('cta_image_id', e.target.value === '' ? null : Number(e.target.value))}
                                    >
                                        <option value="">Automatic</option>
                                        {gallery_images.map((image) => (
                                            <option key={image.id} value={image.id}>
                                                {image.alt_text ? `${image.alt_text} · ${image.section_name}` : image.section_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.cta_image_id && <p className="field-error">{errors.cta_image_id}</p>}
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        {/* ---- Invoice template ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Invoice template</h2>
                            <div className="mt-5 space-y-3">
                                {TEMPLATES.map((tpl) => {
                                    const selected = data.invoice_template === tpl.id;
                                    return (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => setData('invoice_template', tpl.id)}
                                            aria-pressed={selected}
                                            className={`w-full rounded-xl border p-4 text-start transition-all duration-200 ${
                                                selected
                                                    ? 'border-accent bg-accent/[0.08]'
                                                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                                            }`}
                                        >
                                            <p className={`text-sm font-semibold ${selected ? 'text-accent' : 'text-white/80'}`}>{tpl.name}</p>
                                            <p className="mt-0.5 text-xs text-white/45">{tpl.description}</p>
                                        </button>
                                    );
                                })}
                                {errors.invoice_template && <p className="field-error">{errors.invoice_template}</p>}
                            </div>

                            <p className="form-label mt-6">Accent colour</p>
                            <div className="flex flex-wrap items-center gap-2.5">
                                {ACCENTS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        aria-label={`Accent ${color}`}
                                        onClick={() => setData('invoice_accent', color)}
                                        className={`h-9 w-9 rounded-full border-2 transition-transform duration-150 hover:scale-110 ${
                                            accent.toLowerCase() === color ? 'border-white' : 'border-white/15'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <label className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/25 transition-colors hover:border-white/50" aria-label="Custom accent">
                                    <input
                                        type="color"
                                        value={accent}
                                        onChange={(e) => setData('invoice_accent', e.target.value)}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <span className="pointer-events-none text-[10px] font-semibold text-white/60">+</span>
                                </label>
                            </div>
                            {errors.invoice_accent && <p className="field-error">{errors.invoice_accent}</p>}
                        </GlassCard>

                        {/* ---- Invoice notes ---- */}
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">Invoice notes</h2>
                            <div className="mt-5 space-y-5">
                                <FormField label="Footer note" error={errors.invoice_footer_note} htmlFor="invoice_footer_note">
                                    <TextInput id="invoice_footer_note" value={data.invoice_footer_note} onChange={(e) => setData('invoice_footer_note', e.target.value)} placeholder="Payment within 30 days…" />
                                </FormField>
                                <FormField label="Thank-you message" error={errors.invoice_thank_you} htmlFor="invoice_thank_you">
                                    <TextInput id="invoice_thank_you" value={data.invoice_thank_you} onChange={(e) => setData('invoice_thank_you', e.target.value)} placeholder="Thank you for your business" />
                                </FormField>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <PrimaryButton className="w-full" disabled={processing}>
                                {processing ? 'Saving…' : 'Save shop settings'}
                            </PrimaryButton>
                        </GlassCard>
                    </div>
                </div>

                {/* ---- Live invoice preview ---- */}
                <GlassCard className="mt-6 p-6">
                    <h2 className="font-heading text-xl italic text-white">Invoice preview</h2>
                    <p className="mt-1 text-xs text-white/40">This is exactly how printed invoices will look.</p>
                    <div className="mt-5 overflow-hidden rounded-2xl bg-neutral-100 p-4 sm:p-8">
                        <div className="mx-auto max-w-[680px] rounded-lg bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-10">
                            <InvoiceDocument
                                shop={{
                                    name: data.shop_name || 'Decore',
                                    tagline: data.tagline || null,
                                    logo_url: previewLogo,
                                    address: data.address || null,
                                    city: data.city || null,
                                    phone: data.phone || null,
                                    email: data.email || null,
                                    tax_number: data.tax_number || null,
                                    commercial_registration: data.commercial_registration || null,
                                }}
                                invoice={MOCK_INVOICE}
                                template={data.invoice_template}
                                accent={accent}
                                footerNote={data.invoice_footer_note || null}
                                thankYou={data.invoice_thank_you || null}
                            />
                        </div>
                    </div>
                </GlassCard>
            </form>

            <div className="mt-6">
                <GlassButton href={route('dashboard')} variant="secondary">Back to dashboard</GlassButton>
            </div>
        </AuthenticatedLayout>
    );
}

/**
 * Ordered bilingual card/step editor: add, remove and reorder entries with
 * English + Arabic title and body. Used for the "Why Decore" cards and the
 * customer-journey steps on the landing page.
 */
function BilingualListEditor({
    items,
    onChange,
    itemNoun,
    error,
}: {
    items: BilingualCard[];
    onChange: (items: BilingualCard[]) => void;
    itemNoun: string;
    error?: string;
}) {
    const update = (index: number, patch: Partial<BilingualCard>) => {
        onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    const remove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="mt-3 space-y-3">
            {items.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-white/35">
                    No custom {itemNoun}s — the built-in defaults are shown on the site.
                </p>
            )}

            {items.map((item, index) => (
                <div key={index} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                            {itemNoun} {index + 1}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => move(index, -1)}
                                disabled={index === 0}
                                aria-label={`Move ${itemNoun} up`}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-colors hover:text-white disabled:opacity-30"
                            >
                                ↑
                            </button>
                            <button
                                type="button"
                                onClick={() => move(index, 1)}
                                disabled={index === items.length - 1}
                                aria-label={`Move ${itemNoun} down`}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-colors hover:text-white disabled:opacity-30"
                            >
                                ↓
                            </button>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                aria-label={`Remove ${itemNoun}`}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-danger/30 text-danger/70 transition-colors hover:border-danger/60 hover:text-danger"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="form-label">Title — EN</label>
                            <input
                                dir="ltr"
                                className="form-input"
                                value={item.title_en}
                                onChange={(e) => update(index, { title_en: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="form-label">Title — AR</label>
                            <input
                                dir="rtl"
                                className="form-input"
                                value={item.title_ar ?? ''}
                                onChange={(e) => update(index, { title_ar: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="form-label">Body — EN</label>
                            <textarea
                                dir="ltr"
                                className="form-input min-h-20"
                                value={item.body_en}
                                onChange={(e) => update(index, { body_en: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="form-label">Body — AR</label>
                            <textarea
                                dir="rtl"
                                className="form-input min-h-20"
                                value={item.body_ar ?? ''}
                                onChange={(e) => update(index, { body_ar: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={() => onChange([...items, { title_en: '', title_ar: '', body_en: '', body_ar: '' }])}
                className="rounded-xl border border-dashed border-accent/40 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
                + Add {itemNoun}
            </button>

            {error && <p className="field-error">{error}</p>}
        </div>
    );
}
