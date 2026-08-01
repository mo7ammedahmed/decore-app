import PublicLayout from '@/Layouts/PublicLayout';
import PublicMaterialCard from '@/Components/PublicMaterialCard';
import ImagePreview from '@/Components/ImagePreview';
import BlurText from '@/Components/BlurText';
import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { TranslationKey } from '@/Utilities/i18n';
import type { ReactNode } from 'react';
import type { Classification, PublicMaterial } from '@/types/domain';
import type { PageProps } from '@/types';

interface LandingProps extends PageProps {
    stats: {
        materials: number;
        classifications: number;
        suppliers: number;
    };
    featured: PublicMaterial[];
    classifications: (Classification & { materials_count: number })[];
}

/* ---- Inline SVG icons (the app ships its iconography inline, no icon lib) ---- */

function ArrowUpRightIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
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

function ReceiptIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 3h10a1 1 0 011 1v17l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21V4a1 1 0 011-1z" />
            <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
    );
}

function BoxIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
            <path d="M3 8l9 5 9-5" />
            <path d="M12 13v8" />
        </svg>
    );
}

function PaletteIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 100 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.2A4.8 4.8 0 0022 10.8 8.8 8.8 0 0012 2z" />
            <circle cx="7.5" cy="11.5" r="1" fill="currentColor" />
            <circle cx="10.5" cy="7.5" r="1" fill="currentColor" />
            <circle cx="15" cy="7.5" r="1" fill="currentColor" />
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

const STAT_META: { key: keyof LandingProps['stats']; labelKey: TranslationKey; icon: ReactNode }[] = [
    { key: 'materials', labelKey: 'landing.stat_materials', icon: <LayersIcon className="h-5 w-5" /> },
    { key: 'classifications', labelKey: 'landing.stat_classifications', icon: <PaletteIcon className="h-5 w-5" /> },
    { key: 'suppliers', labelKey: 'landing.stat_suppliers', icon: <HandshakeIcon className="h-5 w-5" /> },
];

const CAPABILITY_TAGS_2: TranslationKey[] = ['landing.cap2_tag1', 'landing.cap2_tag2', 'landing.cap2_tag3', 'landing.cap2_tag4'];
const CAPABILITY_TAGS_3: TranslationKey[] = ['landing.cap3_tag1', 'landing.cap3_tag2', 'landing.cap3_tag3', 'landing.cap3_tag4'];

export default function Landing({ auth, stats, featured, classifications }: LandingProps) {
    const user = auth.user;
    const { t } = useI18n();
    const reduceMotion = useReducedMotion();

    const heroHeadline = `${t('landing.hero_line1')} ${t('landing.hero_accent')} ${t('landing.hero_line2')}`;

    const ambient = reduceMotion
        ? {}
        : {
              animate: { opacity: [0.45, 0.85, 0.45], scale: [1, 1.08, 1] },
              transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' as const },
          };

    return (
        <PublicLayout title={t('public.tagline')}>
            {/* ================= Hero — full viewport cinematic ================= */}
            <section className="relative flex min-h-screen flex-col overflow-hidden">
                {/* Atmospheric glows — the shop's own cinematic backdrop (no video asset) */}
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <motion.div
                        {...ambient}
                        className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-[130px]"
                    />
                    <motion.div
                        {...ambient}
                        className="absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-white/[0.05] blur-[110px]"
                    />
                    <div className="absolute bottom-0 left-[-5%] h-72 w-72 rounded-full bg-accent/[0.05] blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 text-center sm:px-6">
                    {/* Badge */}
                    <motion.div
                        initial={fadeUp.initial}
                        animate={fadeUp.animate}
                        transition={{ ...fadeUpTransition, delay: 0.4 }}
                        className="liquid-glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm text-white/85"
                    >
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black">
                            {t('landing.hero_badge_tag')}
                        </span>
                        <span className="font-light">{t('landing.hero_badge')}</span>
                    </motion.div>

                    {/* Headline — word-by-word blur-in */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                        <h1 className="mt-8 max-w-4xl text-6xl leading-[0.82] md:text-7xl lg:text-[5.5rem]">
                            <BlurText text={heroHeadline} highlightWord={t('landing.hero_accent')} delay={0.55} />
                        </h1>
                    </motion.div>

                    {/* Subtext */}
                    <motion.p
                        initial={fadeUp.initial}
                        animate={fadeUp.animate}
                        transition={{ ...fadeUpTransition, delay: 0.9 }}
                        className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/70 md:text-base"
                    >
                        {t('landing.hero_sub')}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={fadeUp.initial}
                        animate={fadeUp.animate}
                        transition={{ ...fadeUpTransition, delay: 1.15 }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-6"
                    >
                        <Link
                            href={route('catalog')}
                            className="liquid-glass-strong inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                            {t('landing.browse_catalog')}
                            <ArrowUpRightIcon className="h-4 w-4 rtl:-scale-x-100" />
                        </Link>
                        <Link
                            href={route('contact')}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-light text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                            <ChatIcon className="h-4 w-4" />
                            {t('nav.contact')}
                        </Link>
                    </motion.div>

                    {/* Stats — real catalogue numbers */}
                    <motion.dl
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
                    >
                        {STAT_META.map(({ key, labelKey, icon }) => (
                            <motion.div
                                key={key}
                                variants={staggerItem}
                                className="liquid-glass flex items-center gap-4 rounded-[1.25rem] p-5 text-start"
                            >
                                <span className="liquid-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] text-accent">
                                    {icon}
                                </span>
                                <div className="min-w-0">
                                    <dt className="truncate text-[11px] uppercase tracking-[0.14em] text-white/40">
                                        {t(labelKey)}
                                    </dt>
                                    <dd className="mt-1 font-heading text-4xl italic leading-none tracking-[-1px] text-white">
                                        {stats[key]}
                                    </dd>
                                </div>
                            </motion.div>
                        ))}
                    </motion.dl>
                </div>

                {/* Trust bar — real collections, italic serif */}
                {classifications.length > 0 && (
                    <motion.div
                        initial={fadeUp.initial}
                        animate={fadeUp.animate}
                        transition={{ ...fadeUpTransition, delay: 1.35 }}
                        className="relative z-10 flex flex-col items-center gap-4 px-4 pb-10"
                    >
                        <span className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/60">
                            {t('landing.trust_label')}
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 md:gap-x-16">
                            {classifications.map((classification) => (
                                <Link
                                    key={classification.id}
                                    href={route('catalog', { classification: classification.id })}
                                    className="font-heading text-2xl italic tracking-tight text-white/45 transition-colors duration-300 hover:text-white md:text-3xl"
                                >
                                    {classification.localized_name ?? classification.name_en}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </section>

            {/* ================= Capabilities — // The atelier ================= */}
            <section className="relative overflow-hidden py-24 sm:py-28">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute left-1/2 top-0 h-96 w-[700px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="max-w-3xl">
                        <motion.p
                            initial={fadeUp.initial}
                            whileInView={fadeUp.animate}
                            viewport={{ once: true }}
                            transition={fadeUpTransition}
                            className="text-sm text-white/70"
                        >
                            {t('landing.capabilities_eyebrow')}
                        </motion.p>
                        <h2 className="mt-6 text-5xl leading-[0.85] md:text-6xl lg:text-[4.5rem]">
                            <BlurText text={t('landing.capabilities_title')} align="start" />
                        </h2>
                        <motion.p
                            initial={fadeUp.initial}
                            whileInView={fadeUp.animate}
                            viewport={{ once: true }}
                            transition={fadeUpTransition}
                            className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base"
                        >
                            {t('landing.capabilities_sub')}
                        </motion.p>
                    </div>

                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        {/* Card 1 — Materials (tags come from the real catalogue) */}
                        <motion.div
                            initial={fadeUp.initial}
                            whileInView={fadeUp.animate}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={fadeUpTransition}
                            className="liquid-glass flex min-h-[380px] flex-col rounded-[1.25rem] p-6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="liquid-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] text-accent">
                                    <LayersIcon className="h-5 w-5" />
                                </span>
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    {classifications.slice(0, 4).map((classification) => (
                                        <span
                                            key={classification.id}
                                            className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 text-[11px] text-white/85"
                                        >
                                            {classification.localized_name ?? classification.name_en}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1" />
                            <h3 className="font-heading text-3xl italic leading-none tracking-[-1px] md:text-4xl">
                                {t('landing.cap1_title')}
                            </h3>
                            <p className="mt-3 max-w-[32ch] text-sm font-light leading-snug text-white/85">
                                {t('landing.cap1_body')}
                            </p>
                        </motion.div>

                        {/* Card 2 — Pricing & Invoicing */}
                        <motion.div
                            initial={fadeUp.initial}
                            whileInView={fadeUp.animate}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ ...fadeUpTransition, delay: 0.15 }}
                            className="liquid-glass flex min-h-[380px] flex-col rounded-[1.25rem] p-6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="liquid-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] text-accent">
                                    <ReceiptIcon className="h-5 w-5" />
                                </span>
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    {CAPABILITY_TAGS_2.map((tag) => (
                                        <span key={tag} className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 text-[11px] text-white/85">
                                            {t(tag)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1" />
                            <h3 className="font-heading text-3xl italic leading-none tracking-[-1px] md:text-4xl">
                                {t('landing.cap2_title')}
                            </h3>
                            <p className="mt-3 max-w-[32ch] text-sm font-light leading-snug text-white/85">
                                {t('landing.cap2_body')}
                            </p>
                        </motion.div>

                        {/* Card 3 — Supplier Workspace */}
                        <motion.div
                            initial={fadeUp.initial}
                            whileInView={fadeUp.animate}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ ...fadeUpTransition, delay: 0.3 }}
                            className="liquid-glass flex min-h-[380px] flex-col rounded-[1.25rem] p-6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="liquid-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] text-accent">
                                    <BoxIcon className="h-5 w-5" />
                                </span>
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    {CAPABILITY_TAGS_3.map((tag) => (
                                        <span key={tag} className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 text-[11px] text-white/85">
                                            {t(tag)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1" />
                            <h3 className="font-heading text-3xl italic leading-none tracking-[-1px] md:text-4xl">
                                {t('landing.cap3_title')}
                            </h3>
                            <p className="mt-3 max-w-[32ch] text-sm font-light leading-snug text-white/85">
                                {t('landing.cap3_body')}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ---- Featured materials (live catalogue data) ---- */}
            {featured.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                                {t('landing.atelier_eyebrow')}
                            </p>
                            <h2 className="mt-3 text-4xl sm:text-5xl">{t('landing.featured_title')}</h2>
                        </div>
                        <Link
                            href={route('catalog')}
                            className="shrink-0 rounded-full px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
                        >
                            {t('common.view_all')} <span className="inline-block rtl:-scale-x-100">→</span>
                        </Link>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {featured.map((material) => (
                            <PublicMaterialCard key={material.id} material={material} />
                        ))}
                    </motion.div>
                </section>
            )}

            {/* ---- Collections ---- */}
            {classifications.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{t('landing.collections_eyebrow')}</p>
                    <h2 className="mt-3 text-4xl sm:text-5xl">{t('landing.collections_title')}</h2>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {classifications.map((classification, index) => {
                            const palette = ['#D4AF7A', '#C89B6C', '#8A7B6B', '#B58E5B', '#A88B5E', '#7C6F5E'];
                            const hex = palette[index % palette.length];

                            return (
                                <Link
                                    key={classification.id}
                                    href={route('catalog', { classification: classification.id })}
                                    className="liquid-glass group flex items-center gap-4 rounded-card p-5 transition-all duration-300 hover:bg-white/[0.03]"
                                >
                                    <ImagePreview url={null} hex={hex} alt={classification.localized_name ?? classification.name_en} size="md" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-heading text-xl italic leading-snug text-white/90 group-hover:text-white">
                                            {classification.localized_name ?? classification.name_en}
                                        </h3>
                                        {classification.description && (
                                            <p className="mt-1 truncate text-xs text-white/40">
                                                {classification.description}
                                            </p>
                                        )}
                                        <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-white/35">
                                            {t('landing.materials_count', { count: classification.materials_count })}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ---- How it works ---- */}
            <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
                <div className="liquid-glass-strong rounded-modal p-8 sm:p-12">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                            {t('landing.how_eyebrow')}
                        </p>
                        <h2 className="mt-3 text-4xl sm:text-5xl">{t('landing.how_title')}</h2>
                        <p className="mt-4 text-white/50">
                            {t('landing.how_sub')}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 sm:grid-cols-3">
                        {[
                            { step: '01', title: t('landing.step1_title'), body: t('landing.step1_body') },
                            { step: '02', title: t('landing.step2_title'), body: t('landing.step2_body') },
                            { step: '03', title: t('landing.step3_title'), body: t('landing.step3_body') },
                        ].map((item) => (
                            <div key={item.step} className="text-center sm:text-start">
                                <span className="font-heading text-5xl italic text-accent/60">{item.step}</span>
                                <h3 className="mt-4 font-heading text-2xl italic text-white/90">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-white/45">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- Final CTA ---- */}
            <section className="mx-auto max-w-6xl px-4 pb-24 text-center sm:px-6">
                <h2 className="text-4xl sm:text-5xl">{t('landing.cta_title')}</h2>
                <p className="mx-auto mt-4 max-w-md text-white/50">
                    {user ? t('landing.cta_authed') : t('landing.cta_guest')}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    {user ? (
                        <Link
                            href={route('dashboard')}
                            className="liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.07]"
                        >
                            {t('common.open_dashboard')}
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('contact')}
                                className="liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.07]"
                            >
                                {t('nav.contact')}
                            </Link>
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white/70 transition-colors hover:text-white"
                            >
                                {t('common.sign_in')}
                            </Link>
                        </>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
