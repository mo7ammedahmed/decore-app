import PublicLayout from '@/Layouts/PublicLayout';
import { motion } from 'framer-motion';
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { TranslationKey } from '@/Utilities/i18n';
import type { PageProps } from '@/types';

interface AboutProps extends PageProps {
    stats: {
        materials: number;
        classifications: number;
        suppliers: number;
    };
}

const STATS: { key: 'materials' | 'classifications' | 'suppliers'; labelKey: TranslationKey }[] = [
    { key: 'materials', labelKey: 'landing.stat_materials' },
    { key: 'classifications', labelKey: 'landing.stat_classifications' },
    { key: 'suppliers', labelKey: 'landing.stat_suppliers' },
];

export default function About({ stats }: AboutProps) {
    const { t } = useI18n();

    return (
        <PublicLayout title={t('nav.about')}>
            <section className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6">
                <motion.div
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    transition={fadeUpTransition}
                    className="max-w-2xl"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                        {t('about.eyebrow')}
                    </p>
                    <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">
                        {t('about.title')}
                    </h1>
                    <p className="mt-6 text-fg/55">
                        {t('about.p1')}
                    </p>
                    <p className="mt-4 text-fg/55">
                        {t('about.p2')}
                    </p>
                </motion.div>

                <motion.dl
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
                >
                    {STATS.map(({ key, labelKey }) => (
                        <motion.div key={labelKey} variants={staggerItem} className="liquid-glass rounded-card px-4 py-6">
                            <dd className="font-heading text-4xl italic text-fg">{stats[key]}</dd>
                            <dt className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-fg/40">{t(labelKey)}</dt>
                        </motion.div>
                    ))}
                </motion.dl>

                <motion.div
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    transition={fadeUpTransition}
                    className="mt-16 grid gap-8 sm:grid-cols-2"
                >
                    {[
                        { titleKey: 'about.f1_title' as const, bodyKey: 'about.f1_body' as const },
                        { titleKey: 'about.f2_title' as const, bodyKey: 'about.f2_body' as const },
                        { titleKey: 'about.f3_title' as const, bodyKey: 'about.f3_body' as const },
                        { titleKey: 'about.f4_title' as const, bodyKey: 'about.f4_body' as const },
                    ].map(({ titleKey, bodyKey }) => (
                        <div key={titleKey}>
                            <h2 className="font-heading text-2xl italic text-fg/90">{t(titleKey)}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-fg/45">{t(bodyKey)}</p>
                        </div>
                    ))}
                </motion.div>
            </section>
        </PublicLayout>
    );
}
