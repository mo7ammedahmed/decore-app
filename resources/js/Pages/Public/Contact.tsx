import PublicLayout from '@/Layouts/PublicLayout';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { PageProps } from '@/types';

type ContactProps = PageProps;

export default function Contact({ shop }: ContactProps) {
    const { t } = useI18n();
    const contactEmail = shop?.email || 'hello@decore.example';
    const contactPhone = shop?.phone || '+966 55 000 0000';

    return (
        <PublicLayout title={t('nav.contact')}>
            <section className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6">
                <motion.div
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    transition={fadeUpTransition}
                    className="max-w-2xl"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{t('contact.eyebrow')}</p>
                    <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">{t('contact.title')}</h1>
                    <p className="mt-6 text-fg/55">
                        {t('contact.sub')}
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {[
                        {
                            title: t('contact.email_title'),
                            body: t('contact.email_body'),
                            value: contactEmail,
                            href: `mailto:${contactEmail}`,
                        },
                        {
                            title: t('contact.phone_title'),
                            body: t('contact.phone_body'),
                            value: contactPhone,
                            href: `tel:${contactPhone.replace(/[^+\d]/g, '')}`,
                        },
                        {
                            title: t('contact.workspace_title'),
                            body: t('contact.workspace_body'),
                            value: t('contact.workspace_value'),
                            href: '/login',
                        },
                    ].map((item) => (
                        <motion.div key={item.title} variants={staggerItem} className="liquid-glass rounded-card p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                                {item.title}
                            </p>
                            <p className="mt-3 text-sm text-fg/45">{item.body}</p>
                            <Link
                                href={item.href}
                                className="mt-4 inline-block text-sm text-fg/85 underline-offset-4 transition-colors hover:text-accent hover:underline"
                            >
                                {item.value}
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    transition={fadeUpTransition}
                    className="liquid-glass-strong mt-12 rounded-modal p-8 sm:p-10"
                >
                    <h2 className="text-3xl">{t('contact.partner_title')}</h2>
                    <p className="mt-3 max-w-xl text-sm text-fg/50">
                        {t('contact.partner_body')}
                    </p>
                    <a
                        href={`mailto:${contactEmail}`}
                        className="liquid-glass-strong mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-fg transition-all duration-200 hover:bg-fg/[0.07]"
                    >
                        {t('contact.partner_cta')}
                    </a>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
