import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';
import { translate, useI18n } from '@/Utilities/i18n';
import type { Locale, TranslationKey } from '@/Utilities/i18n';

interface SiteContentPageProps {
    content: Record<string, { en: string; ar: string }>;
}

interface Group {
    id: string;
    title: string;
    description: string;
    prefixes: string[];
}

const GROUPS: Group[] = [
    {
        id: 'hero',
        title: 'Landing — hero',
        description: 'The first screen visitors see: headline, subtext and trust bar.',
        prefixes: ['landing.hero_', 'landing.browse_', 'landing.trust_', 'landing.stat_'],
    },
    {
        id: 'capabilities',
        title: 'Landing — capabilities',
        description: 'The three capability cards and their tags.',
        prefixes: ['landing.atelier_', 'landing.capabilities_', 'landing.cap'],
    },
    {
        id: 'collections',
        title: 'Landing — featured & collections',
        description: 'Featured finishes heading and the browse-by-collection block.',
        prefixes: ['landing.featured_', 'landing.collections_', 'landing.materials_count'],
    },
    {
        id: 'how',
        title: 'Landing — how it works',
        description: 'The three-step journey section.',
        prefixes: ['landing.how_', 'landing.step'],
    },
    {
        id: 'cta',
        title: 'Landing — call to action',
        description: 'The closing invitation to sign in or reach out.',
        prefixes: ['landing.cta_'],
    },
    {
        id: 'catalog',
        title: 'Catalog',
        description: 'The public material catalog page.',
        prefixes: ['catalog.'],
    },
    {
        id: 'cards',
        title: 'Material cards & detail',
        description: 'Labels on public material cards and the finish detail page.',
        prefixes: ['pmc.', 'show.'],
    },
    {
        id: 'about',
        title: 'About',
        description: 'The about-the-atelier page.',
        prefixes: ['about.'],
    },
    {
        id: 'contact',
        title: 'Contact',
        description: 'The contact page cards and partner block.',
        prefixes: ['contact.'],
    },
    {
        id: 'taglines',
        title: 'Taglines',
        description: 'The short shop tagline shown in headers and footers.',
        prefixes: ['public.tagline', 'guest.tagline'],
    },
];

function humanLabel(key: string): string {
    const name = key.split('.').slice(1).join(' ');
    return name
        .split('_')
        .map((word) => (word.length <= 3 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(' ');
}

export default function SiteContentIndex({ content }: SiteContentPageProps) {
    const { locale } = useI18n();
    const { data, setData, patch, processing, errors } = useForm({ content });

    const setField = (key: string, lang: 'en' | 'ar', value: string) => {
        setData((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                [key]: { ...prev.content[key], [lang]: value },
            },
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('site-content.update'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Public site content" />

            <PageHeader
                title="Public site content"
                description="Every visitor-facing string on the landing, catalog, about and contact pages. Leave a field empty to keep the current default — type in either language to override it."
            />

            <form onSubmit={submit} className="space-y-6">
                {GROUPS.map((group) => {
                    const keys = Object.keys(content)
                        .filter((key) => group.prefixes.some((p) => key.startsWith(p)))
                        .sort();

                    if (keys.length === 0) return null;

                    return (
                        <GlassCard key={group.id} className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{group.title}</h2>
                            <p className="mt-1 text-xs text-white/40">{group.description}</p>

                            <div className="mt-6 space-y-6">
                                {keys.map((key) => {
                                    const defaultEn = translate('en' as Locale, key as TranslationKey);
                                    const defaultAr = translate('ar' as Locale, key as TranslationKey);

                                    return (
                                        <div key={key} className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor={`${key}.en`} className="form-label">
                                                    {humanLabel(key)} — EN
                                                </label>
                                                <input
                                                    id={`${key}.en`}
                                                    dir="ltr"
                                                    className="form-input"
                                                    value={data.content[key]?.en ?? ''}
                                                    onChange={(e) => setField(key, 'en', e.target.value)}
                                                    placeholder={defaultEn}
                                                    title={`Default: ${defaultEn}`}
                                                />
                                                {errors[`content.${key}.en`] && (
                                                    <p className="field-error">{errors[`content.${key}.en`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor={`${key}.ar`} className="form-label">
                                                    {humanLabel(key)} — AR
                                                </label>
                                                <input
                                                    id={`${key}.ar`}
                                                    dir="rtl"
                                                    className="form-input"
                                                    value={data.content[key]?.ar ?? ''}
                                                    onChange={(e) => setField(key, 'ar', e.target.value)}
                                                    placeholder={defaultAr}
                                                    title={`Default: ${defaultAr}`}
                                                />
                                                {errors[`content.${key}.ar`] && (
                                                    <p className="field-error">{errors[`content.${key}.ar`]}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    );
                })}

                <div className="flex items-center justify-end gap-3">
                    <p className="mr-auto text-xs text-white/35">
                        {locale === 'ar' ? 'اترك الحقل فارغًا للاحتفاظ بالافتراضي' : 'Empty fields keep the current default.'}
                    </p>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving…' : 'Save public content'}
                    </PrimaryButton>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
