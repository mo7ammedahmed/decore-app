import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import PublicImage from '@/Components/PublicImage';
import PublicSectionHeading from '@/Components/PublicSectionHeading';
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { TranslationKey } from '@/Utilities/i18n';
import type { Classification } from '@/types/domain';
import type { PageProps as InertiaPageProps } from '@/types';

interface AboutProps extends InertiaPageProps {
    stats: {
        materials: number;
        classifications: number;
        suppliers: number;
    };
    classifications: Classification[];
    inspiration: { id: number; image_url: string | null; alt_text: string | null; section_name: string }[];
}

const STATS: { key: 'materials' | 'classifications' | 'suppliers'; labelKey: TranslationKey }[] = [
    { key: 'materials', labelKey: 'landing.stat_materials' },
    { key: 'classifications', labelKey: 'landing.stat_classifications' },
    { key: 'suppliers', labelKey: 'landing.stat_suppliers' },
];

const OFFERS: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
    { titleKey: 'about.what_1_title', bodyKey: 'about.what_1_body' },
    { titleKey: 'about.what_2_title', bodyKey: 'about.what_2_body' },
    { titleKey: 'about.what_3_title', bodyKey: 'about.what_3_body' },
];

const AUDIENCES: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
    { titleKey: 'about.who_1_title', bodyKey: 'about.who_1_body' },
    { titleKey: 'about.who_2_title', bodyKey: 'about.who_2_body' },
    { titleKey: 'about.who_3_title', bodyKey: 'about.who_3_body' },
    { titleKey: 'about.who_4_title', bodyKey: 'about.who_4_body' },
];

export default function About({ stats, classifications, inspiration }: AboutProps) {
    const { t, locale } = useI18n();

    const nameOf = (item: { name_en: string; name_ar?: string | null }) =>
        locale === 'ar' && item.name_ar ? item.name_ar : item.name_en;

    // Editorial composition: one tall image + two stacked, when available.
    const [leadImage, ...rest] = inspiration.slice(0, 3);

    return (
        <PublicLayout title={t('nav.about')}>
            <Head>
                <meta name="description" content={t('about.lead')} />
                <meta property="og:title" content={t('about.title')} />
                <meta property="og:description" content={t('about.lead')} />
                {leadImage?.image_url && <meta property="og:image" content={leadImage.image_url} />}
            </Head>

            <section className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
                {/* Intro */}
                <motion.div
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    transition={fadeUpTransition}
                    className="grid gap-10 lg:grid-cols-12 lg:items-end"
                >
                    <div className="lg:col-span-7">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{t('about.eyebrow')}</p>
                        <h1 className="mt-3 font-heading text-5xl italic leading-[1.02] tracking-[-0.02em] sm:text-6xl">
                            {t('about.title')}
                        </h1>
                    </div>
                    <p className="text-sm font-light leading-relaxed text-fg/55 lg:col-span-5 lg:pb-1">
                        {t('about.lead')}
                    </p>
                </motion.div>

                {/* Editorial composition */}
                {leadImage && (
                    <div className="mt-14 grid gap-4 lg:grid-cols-3">
                        <motion.div
                            initial={fadeUp.initial}
                            animate={fadeUp.animate}
                            transition={fadeUpTransition}
                            className="lg:col-span-2"
                        >
                            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                                <PublicImage
                                    src={leadImage.image_url}
                                    alt={leadImage.alt_text ?? leadImage.section_name}
                                    label={leadImage.section_name}
                                    className="aspect-[16/10] w-full object-cover"
                                />
                            </div>
                        </motion.div>
                        <div className="grid gap-4">
                            {rest.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    initial={fadeUp.initial}
                                    animate={fadeUp.animate}
                                    transition={{ ...fadeUpTransition, delay: index * 0.1 }}
                                    className="overflow-hidden rounded-2xl border border-line bg-surface"
                                >
                                    <PublicImage
                                        src={image.image_url}
                                        alt={image.alt_text ?? image.section_name}
                                        label={image.section_name}
                                        className="aspect-[16/9] w-full object-cover"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats — real catalogue numbers */}
                <motion.dl
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="mt-16 grid grid-cols-1 gap-4 border-y border-line py-8 sm:grid-cols-3"
                >
                    {STATS.map(({ key, labelKey }) => (
                        <motion.div key={labelKey} variants={staggerItem} className="text-center sm:text-start">
                            <dd className="font-heading text-5xl italic text-fg">{stats[key]}</dd>
                            <dt className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-fg/40">{t(labelKey)}</dt>
                        </motion.div>
                    ))}
                </motion.dl>

                {/* What we offer */}
                <section className="mt-20">
                    <PublicSectionHeading eyebrow={t('about.what_title')} title={t('about.what_title')} />
                    <div className="mt-8 grid gap-5 sm:grid-cols-3">
                        {OFFERS.map(({ titleKey, bodyKey }, index) => (
                            <motion.div
                                key={titleKey}
                                initial={fadeUp.initial}
                                whileInView={fadeUp.animate}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ ...fadeUpTransition, delay: index * 0.08 }}
                                className="rounded-2xl border border-line bg-surface/60 p-6"
                            >
                                <h3 className="font-heading text-2xl italic text-fg">{t(titleKey)}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-fg/55">{t(bodyKey)}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Collections we carry */}
                {classifications.length > 0 && (
                    <section className="mt-20">
                        <PublicSectionHeading
                            eyebrow={t('about.suppliers_title')}
                            title={t('about.suppliers_body')}
                        />
                        <div className="mt-8 flex flex-wrap gap-2.5">
                            {classifications.map((classification) => (
                                <Link
                                    key={classification.id}
                                    href={route('catalog', { classification: classification.id })}
                                    className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg/70 transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                >
                                    {nameOf(classification)}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Who we serve */}
                <section className="mt-20">
                    <PublicSectionHeading eyebrow={t('about.who_title')} title={t('about.who_title')} />
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {AUDIENCES.map(({ titleKey, bodyKey }, index) => (
                            <motion.div
                                key={titleKey}
                                initial={fadeUp.initial}
                                whileInView={fadeUp.animate}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ ...fadeUpTransition, delay: index * 0.06 }}
                                className="rounded-2xl border border-line bg-surface/60 p-6"
                            >
                                <h3 className="font-heading text-xl italic text-fg">{t(titleKey)}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-fg/50">{t(bodyKey)}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mt-20 rounded-3xl border border-line bg-surface/40 p-10 text-center sm:p-14">
                    <h2 className="font-heading text-4xl italic text-fg sm:text-5xl">{t('about.cta_title')}</h2>
                    <p className="mx-auto mt-4 max-w-md text-sm text-fg/50">{t('about.cta_body')}</p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={route('catalog')}
                            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                        >
                            {t('landing.cta_catalog')}
                        </Link>
                        <Link
                            href={route('contact')}
                            className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-medium text-fg/70 transition-colors hover:border-fg/40 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                        >
                            {t('landing.cta_contact')}
                        </Link>
                    </div>
                </section>
            </section>
        </PublicLayout>
    );
}
