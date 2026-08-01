import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import PublicSectionHeading from '@/Components/PublicSectionHeading';
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { ShopProfile, ShopSettings } from '@/types/domain';

/** `tel:` href — keep only digits, with a single leading + when present. */
function telHref(phone: string): string {
    const trimmed = phone.trim();
    const digits = trimmed.replace(/\D/g, '');
    return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`;
}

/** WhatsApp href — full URL passes through, bare numbers become wa.me/<digits>. */
function waHref(whatsapp: string): string {
    const value = whatsapp.trim();
    if (/^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : value;
}

export default function Contact() {
    const { t } = useI18n();
    const { props } = usePage();
    const profile = (props.profile as ShopProfile | undefined) ?? null;
    const shop = (props.shop as ShopSettings | undefined) ?? null;

    const phone = profile?.phone?.trim() || shop?.phone?.trim() || '';
    const email = profile?.email?.trim() || shop?.email?.trim() || '';
    const whatsapp = profile?.whatsapp?.trim() || '';
    const address = [shop?.address, shop?.city].filter(Boolean).join(', ');

    const cards: {
        title: string;
        body: string;
        value: string;
        href?: string;
        external?: boolean;
        accent?: boolean;
    }[] = [
        ...(whatsapp
            ? [{
                  title: t('contact.whatsapp_title'),
                  body: t('contact.whatsapp_body'),
                  value: whatsapp,
                  href: waHref(whatsapp),
                  external: true,
                  accent: true,
              }]
            : []),
        ...(phone
            ? [{
                  title: t('contact.phone_title'),
                  body: t('contact.phone_body'),
                  value: phone,
                  href: telHref(phone),
              }]
            : []),
        ...(email
            ? [{
                  title: t('contact.email_title'),
                  body: t('contact.email_body'),
                  value: email,
                  href: `mailto:${email}`,
              }]
            : []),
        ...(address
            ? [{
                  title: t('contact.address_title'),
                  body: t('contact.address_body'),
                  value: address,
              }]
            : []),
    ];

    return (
        <PublicLayout title={t('nav.contact')}>
            <Head>
                <meta name="description" content={t('contact.sub')} />
                <meta property="og:title" content={t('contact.title')} />
                <meta property="og:description" content={t('contact.sub')} />
            </Head>

            <section className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
                <PublicSectionHeading level="h1" eyebrow={t('contact.eyebrow')} title={t('contact.title')} sub={t('contact.sub')} />

                {/* Primary contact grid */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {cards.map((item) => (
                        <motion.div
                            key={item.title}
                            variants={staggerItem}
                            className={`rounded-2xl border p-6 transition-colors duration-300 ${
                                item.accent
                                    ? 'border-accent/40 bg-accent/10'
                                    : 'border-line bg-surface/60 hover:border-fg/25'
                            }`}
                        >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{item.title}</p>
                            <p className="mt-3 text-sm leading-relaxed text-fg/50">{item.body}</p>
                            {item.href ? (
                                <a
                                    href={item.href}
                                    target={item.external ? '_blank' : undefined}
                                    rel={item.external ? 'noopener noreferrer' : undefined}
                                    dir="ltr"
                                    className="mt-4 inline-block break-all text-sm font-medium text-fg/85 underline-offset-4 transition-colors hover:text-accent hover:underline"
                                >
                                    {item.value}
                                </a>
                            ) : (
                                <p dir="auto" className="mt-4 text-sm font-medium text-fg/85">{item.value}</p>
                            )}
                        </motion.div>
                    ))}

                    {/* Working hours card */}
                    <motion.div variants={staggerItem} className="rounded-2xl border border-line bg-surface/60 p-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{t('contact.hours_title')}</p>
                        <p className="mt-3 text-sm leading-relaxed text-fg/50">{t('contact.hours_value')}</p>
                        <p className="mt-4 text-sm font-medium text-fg/85">{t('contact.enquiry_title')}</p>
                        <p className="mt-1 text-sm text-fg/50">{t('contact.enquiry_body')}</p>
                    </motion.div>
                </motion.div>

                {/* Quote/enquiry action */}
                {email && (
                    <motion.div
                        initial={fadeUp.initial}
                        animate={fadeUp.animate}
                        transition={fadeUpTransition}
                        className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-line bg-surface/40 p-8 text-center sm:flex-row sm:text-start"
                    >
                        <div>
                            <h2 className="font-heading text-2xl italic text-fg sm:text-3xl">{t('contact.enquiry_title')}</h2>
                            <p className="mt-2 max-w-lg text-sm leading-relaxed text-fg/50">{t('contact.enquiry_body')}</p>
                        </div>
                        <a
                            href={`mailto:${email}?subject=${encodeURIComponent(t('contact.quote_cta'))}`}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-canvas transition-all duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                        >
                            {t('contact.quote_cta')}
                            <svg className="h-4 w-4 rtl:-scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </a>
                    </motion.div>
                )}

                {/* Subtle staff/supplier sign-in — never a primary guest action */}
                <p className="mt-12 text-center text-xs text-fg/30">
                    {t('contact.staff_sign_in')}{' '}
                    <Link href="/login" className="text-fg/45 underline-offset-4 transition-colors hover:text-fg hover:underline">
                        {t('common.sign_in')}
                    </Link>
                </p>
            </section>
        </PublicLayout>
    );
}
