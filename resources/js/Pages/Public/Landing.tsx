import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import PublicImage from '@/Components/PublicImage';
import PublicMaterialCard from '@/Components/PublicMaterialCard';
import PublicSectionHeading from '@/Components/PublicSectionHeading';
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { TranslationKey } from '@/Utilities/i18n';
import { useAppearance } from '@/Utilities/appearance';
import type { Classification, PublicMaterial } from '@/types/domain';
import type { PageProps } from '@/types';

interface LandingProps extends PageProps {
    stats: {
        materials: number;
        classifications: number;
        suppliers: number;
    };
    hero: { image_url: string | null; alt_text: string | null } | null;
    /** Admin-picked final CTA background (null = automatic). */
    cta?: { image_url: string | null; alt_text: string | null } | null;
    featured: PublicMaterial[];
    inspiration: { id: number; image_url: string | null; alt_text: string | null; section_name: string }[];
    classifications: (Classification & { image_url?: string | null; image_alt_text?: string | null; materials_count: number })[];
    /** Which sections the admin chose to show (false = hidden). */
    landing_sections?: Record<string, boolean>;
    /** Admin-curated bilingual 'Why Decore' cards (empty = code defaults). */
    why_cards?: { title_en: string; title_ar: string | null; body_en: string; body_ar: string | null }[];
    /** Admin-curated bilingual customer-journey steps (empty = code defaults). */
    journey_steps?: { title_en: string; title_ar: string | null; body_en: string; body_ar: string | null }[];
}

/* ---- Inline SVG icons (the app ships its iconography inline, no icon lib) ---- */

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

function ChatIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
    );
}

function LayersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 12l10 5 10-5" />
            <path d="M2 17l10 5 10-5" />
        </svg>
    );
}

function HandshakeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 17l2 2a1 1 0 001.4 0l3.6-3.6a1 1 0 000-1.4L14 10" />
            <path d="M14 14l1.5 1.5a1 1 0 001.4 0L20 12.5" />
            <path d="M3 7l3-3h5l3 3-3 3H6l-3-3z" />
            <path d="M6 10v4l3 3" />
            <path d="M3 7l3 3" />
        </svg>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function RulerIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l4 4L21 7l-4-4L3 17z" />
            <path d="M8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" />
        </svg>
    );
}

function HomeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M10 21v-6h4v6" />
        </svg>
    );
}

function QuoteIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10h3v4a3 3 0 01-3 3" />
            <path d="M14 10h3v4a3 3 0 01-3 3" />
            <path d="M4 4h16v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
    );
}

const STATS: { key: keyof LandingProps['stats']; labelKey: TranslationKey; icon: React.ReactNode }[] = [
    { key: 'materials', labelKey: 'landing.stat_materials', icon: <LayersIcon className="h-5 w-5" /> },
    { key: 'classifications', labelKey: 'landing.stat_classifications', icon: <RulerIcon className="h-5 w-5" /> },
    { key: 'suppliers', labelKey: 'landing.stat_suppliers', icon: <HandshakeIcon className="h-5 w-5" /> },
];

const WHY: { titleKey: TranslationKey; bodyKey: TranslationKey; icon: React.ReactNode }[] = [
    { titleKey: 'landing.why_1_title', bodyKey: 'landing.why_1_body', icon: <LayersIcon className="h-5 w-5" /> },
    { titleKey: 'landing.why_2_title', bodyKey: 'landing.why_2_body', icon: <HandshakeIcon className="h-5 w-5" /> },
    { titleKey: 'landing.why_3_title', bodyKey: 'landing.why_3_body', icon: <ShieldIcon className="h-5 w-5" /> },
    { titleKey: 'landing.why_4_title', bodyKey: 'landing.why_4_body', icon: <RulerIcon className="h-5 w-5" /> },
    { titleKey: 'landing.why_5_title', bodyKey: 'landing.why_5_body', icon: <HomeIcon className="h-5 w-5" /> },
    { titleKey: 'landing.why_6_title', bodyKey: 'landing.why_6_body', icon: <QuoteIcon className="h-5 w-5" /> },
];

const WHY_ICONS = [
    <LayersIcon className="h-5 w-5" />,
    <HandshakeIcon className="h-5 w-5" />,
    <ShieldIcon className="h-5 w-5" />,
    <RulerIcon className="h-5 w-5" />,
    <HomeIcon className="h-5 w-5" />,
    <QuoteIcon className="h-5 w-5" />,
];

const JOURNEY_STEPS: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
    { titleKey: 'landing.step1_title', bodyKey: 'landing.step1_body' },
    { titleKey: 'landing.step2_title', bodyKey: 'landing.step2_body' },
    { titleKey: 'landing.step3_title', bodyKey: 'landing.step3_body' },
    { titleKey: 'landing.step4_title', bodyKey: 'landing.step4_body' },
];

/** Pick the Arabic text when it exists, else fall back to English. */
function localized(en: string, ar: string | null, locale: string): string {
    return locale === 'ar' && ar ? ar : en;
}

export default function Landing({ stats, hero, cta, featured, inspiration, classifications, landing_sections, why_cards, journey_steps }: LandingProps) {
    const { t, locale } = useI18n();
    const reduceMotion = useReducedMotion();
    const appearance = useAppearance();
    const heroImage = hero?.image_url ?? null;
    const heroAlt = hero?.alt_text ?? t('landing.hero_kicker');
    // Final CTA background: the admin-picked gallery image, else the newest
    // published image (same source as the inspiration mosaic), else the texture.
    const ctaImage = cta?.image_url ?? inspiration[0]?.image_url ?? null;

    // Dashboard-controlled section visibility (default: everything visible).
    const show = {
        collections: landing_sections?.collections !== false,
        featured: landing_sections?.featured !== false,
        inspiration: landing_sections?.inspiration !== false,
        why: landing_sections?.why !== false,
        journey: landing_sections?.journey !== false,
        cta: landing_sections?.cta !== false,
    };

    // The hero sits behind the transparent header — scrim darkens the top in
    // dark mode and lightens it in light mode so the header stays readable.
    const topScrim = appearance === 'light'
        ? 'from-white/70 via-white/25 to-transparent'
        : 'from-black/60 via-black/25 to-transparent';

    const motionProps = reduceMotion
        ? {}
        : { initial: fadeUp.initial, whileInView: fadeUp.animate, viewport: { once: true, margin: '-60px' }, transition: fadeUpTransition };

    return (
        <PublicLayout title={t('landing.hero_kicker')} transparentHeader>
            <Head>
                <meta name="description" content={t('landing.hero_sub')} />
                <meta property="og:title" content={`${t('landing.hero_line1')} ${t('landing.hero_line2')}`} />
                <meta property="og:description" content={t('landing.hero_sub')} />
                {heroImage && <meta property="og:image" content={heroImage} />}
            </Head>

            {/* ================= Hero — image-led, full viewport ================= */}
            <section className="relative -mt-16 flex min-h-[92vh] flex-col overflow-hidden">
                {/* Background image (or warm texture when no project photo exists) */}
                <div className="absolute inset-0" aria-hidden="true">
                    {heroImage ? (
                        // Hero image loads eagerly by default — no loading=lazy,
                        // no fetchPriority (unsupported by React 18 and a no-op).
                        <img src={heroImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="material-texture h-full w-full" />
                    )}
                    <div className={`absolute inset-x-0 top-0 h-64 bg-gradient-to-b ${topScrim}`} />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-canvas via-canvas/70 to-transparent" />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-16 pt-40 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <motion.p
                            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={fadeUpTransition}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-sm"
                        >
                            {t('landing.hero_kicker')}
                        </motion.p>

                        <motion.h1
                            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ ...fadeUpTransition, delay: 0.1 }}
                            className="mt-6 text-5xl leading-[0.98] text-white sm:text-6xl lg:text-7xl"
                        >
                            {t('landing.hero_line1')}{' '}
                            <em className="text-accent">{t('landing.hero_accent')}</em>{' '}
                            {t('landing.hero_line2')}
                        </motion.h1>

                        <motion.p
                            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ ...fadeUpTransition, delay: 0.2 }}
                            className="mt-6 max-w-xl text-sm font-light leading-relaxed text-white/75 md:text-base"
                        >
                            {t('landing.hero_sub')}
                        </motion.p>

                        <motion.div
                            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ ...fadeUpTransition, delay: 0.3 }}
                            className="mt-9 flex flex-wrap items-center gap-4"
                        >
                            <Link
                                href={route('catalog')}
                                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                {t('landing.hero_cta_catalog')}
                                <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                            </Link>
                            <Link
                                href={route('gallery')}
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                {t('landing.hero_cta_gallery')}
                            </Link>
                        </motion.div>

                        {/* Trust indicators — real catalogue numbers */}
                        <motion.dl
                            initial="hidden"
                            animate="show"
                            variants={staggerContainer}
                            className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-6"
                        >
                            {STATS.map(({ key, labelKey }) => (
                                <motion.div key={key} variants={staggerItem} className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
                                        {STATS.find((s) => s.key === key)?.icon}
                                    </span>
                                    <div>
                                        <dd className="font-heading text-2xl italic leading-none text-white">{stats[key]}</dd>
                                        <dt className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/50">{t(labelKey)}</dt>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.dl>
                    </div>
                </div>
            </section>

            {/* ================= Collections — showroom tiles ================= */}
            {show.collections && classifications.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 sm:py-24">
                    <div className="flex items-end justify-between gap-6">
                        <PublicSectionHeading
                            eyebrow={t('landing.collections_eyebrow')}
                            title={t('landing.collections_title')}
                            sub={t('landing.collections_sub')}
                        />
                        <Link
                            href={route('catalog')}
                            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-fg/60 transition-colors hover:text-fg sm:inline-flex"
                        >
                            {t('common.view_all')}
                            <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                        </Link>
                    </div>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {classifications.map((classification, index) => (
                            <motion.div
                                key={classification.id}
                                initial={reduceMotion ? undefined : fadeUp.initial}
                                whileInView={reduceMotion ? undefined : fadeUp.animate}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ ...fadeUpTransition, delay: (index % 3) * 0.08 }}
                                className={index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}
                            >
                                <Link
                                    href={route('catalog', { classification: classification.id })}
                                    className="group relative block overflow-hidden rounded-2xl border border-line bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                                >
                                    <PublicImage
                                        src={classification.image_url}
                                        alt={classification.image_alt_text ?? classification.localized_name ?? classification.name_en}
                                        label={classification.localized_name ?? classification.name_en}
                                        className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${index === 0 ? 'aspect-[16/10] lg:aspect-[16/9]' : 'aspect-[4/3]'}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                                        <div>
                                            <h3 className="font-heading text-2xl italic leading-snug text-white sm:text-3xl">
                                                {classification.localized_name ?? classification.name_en}
                                            </h3>
                                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">
                                                {t('landing.materials_count', { count: classification.materials_count })}
                                            </p>
                                        </div>
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                                            <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ================= Featured finishes ================= */}
            {show.featured && featured.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
                    <div className="flex items-end justify-between gap-6">
                        <PublicSectionHeading
                            eyebrow={t('landing.featured_eyebrow')}
                            title={t('landing.featured_title')}
                            sub={t('landing.featured_sub')}
                        />
                        <Link
                            href={route('catalog')}
                            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-fg/60 transition-colors hover:text-fg sm:inline-flex"
                        >
                            {t('common.view_all')}
                            <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                        </Link>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {featured.map((material) => (
                            <PublicMaterialCard key={material.id} material={material} />
                        ))}
                    </motion.div>
                </section>
            )}

            {/* ================= Project inspiration ================= */}
            {show.inspiration && inspiration.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
                    <div className="flex items-end justify-between gap-6">
                        <PublicSectionHeading
                            eyebrow={t('landing.inspiration_eyebrow')}
                            title={t('landing.inspiration_title')}
                            sub={t('landing.inspiration_sub')}
                        />
                        <Link
                            href={route('gallery')}
                            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-fg/60 transition-colors hover:text-fg sm:inline-flex"
                        >
                            {t('landing.inspiration_cta')}
                            <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                        </Link>
                    </div>

                    <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
                        {inspiration.map((image, index) => (
                            <motion.figure
                                key={image.id}
                                initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ ...fadeUpTransition, delay: (index % 4) * 0.06 }}
                                className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-line"
                            >
                                <Link href={route('gallery')} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                                    <PublicImage
                                        src={image.image_url}
                                        alt={image.alt_text ?? image.section_name}
                                        label={image.section_name}
                                        className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                    />
                                    {image.section_name && (
                                        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs font-medium uppercase tracking-[0.14em] text-white/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            {image.section_name}
                                        </figcaption>
                                    )}
                                </Link>
                            </motion.figure>
                        ))}
                    </div>

                    <div className="mt-8 text-center sm:hidden">
                        <Link href={route('gallery')} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                            {t('landing.inspiration_cta')}
                            <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                        </Link>
                    </div>
                </section>
            )}

            {/* ================= Why choose Decore ================= */}
            {show.why && (
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
                <PublicSectionHeading
                    eyebrow={t('landing.why_eyebrow')}
                    title={t('landing.why_title')}
                    sub={t('landing.why_sub')}
                    align="center"
                />

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={staggerContainer}
                    className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {(() => {
                        const cards = why_cards && why_cards.length > 0
                            ? why_cards.map((card, index) => ({
                                  title: localized(card.title_en, card.title_ar, locale),
                                  body: localized(card.body_en, card.body_ar, locale),
                                  icon: WHY_ICONS[index % WHY_ICONS.length],
                                  key: `card-${index}`,
                              }))
                            : WHY.map(({ titleKey, bodyKey, icon }) => ({
                                  title: t(titleKey),
                                  body: t(bodyKey),
                                  icon,
                                  key: titleKey,
                              }));

                        return cards.map((card) => (
                            <motion.div
                                key={card.key}
                                variants={staggerItem}
                                className="rounded-2xl border border-line bg-surface/60 p-6 transition-colors duration-300 hover:border-accent/30"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                    {card.icon}
                                </span>
                                <h3 className="mt-5 font-heading text-2xl italic text-fg">{card.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-fg/55">{card.body}</p>
                            </motion.div>
                        ));
                    })()}
                </motion.div>
            </section>
            )}

            {/* ================= Customer journey ================= */}
            {show.journey && (
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
                <div className="rounded-3xl border border-line bg-surface/40 p-8 sm:p-12">
                    <PublicSectionHeading
                        eyebrow={t('landing.journey_eyebrow')}
                        title={t('landing.journey_title')}
                        sub={t('landing.journey_sub')}
                        align="center"
                    />

                    <motion.ol
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={staggerContainer}
                        className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {(() => {
                            const steps = journey_steps && journey_steps.length > 0
                                ? journey_steps.map((step) => ({
                                      title: localized(step.title_en, step.title_ar, locale),
                                      body: localized(step.body_en, step.body_ar, locale),
                                  }))
                                : JOURNEY_STEPS.map(({ titleKey, bodyKey }) => ({
                                      title: t(titleKey),
                                      body: t(bodyKey),
                                  }));

                            return steps.map((step, index) => (
                                <motion.li
                                    key={`step-${index}`}
                                    variants={staggerItem}
                                    className="relative text-center sm:text-start"
                                >
                                    <span className="font-heading text-5xl italic text-accent/50">{String(index + 1).padStart(2, '0')}</span>
                                    <h3 className="mt-3 font-heading text-xl italic text-fg/90">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-fg/45">{step.body}</p>
                                </motion.li>
                            ));
                        })()}
                    </motion.ol>
                </div>
            </section>
            )}

            {/* ================= Final CTA — image-backed ================= */}
            {show.cta && (
            <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                <motion.div {...motionProps} className="relative overflow-hidden rounded-3xl border border-line">
                    {ctaImage ? (
                        <img
                            src={ctaImage}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <div className="material-texture absolute inset-0" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    <div className="relative z-10 flex flex-col items-center px-6 py-20 text-center sm:py-24">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{t('landing.cta_sub')}</p>
                        <h2 className="mt-4 max-w-2xl text-4xl leading-[1.02] text-white sm:text-5xl">
                            {t('landing.cta_title')}
                        </h2>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href={route('catalog')}
                                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                {t('landing.cta_catalog')}
                                <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                            </Link>
                            <Link
                                href={route('gallery')}
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                {t('landing.cta_gallery')}
                            </Link>
                            <Link
                                href={route('contact')}
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                <ChatIcon className="h-4 w-4" />
                                {t('landing.cta_contact')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
            )}
        </PublicLayout>
    );
}
