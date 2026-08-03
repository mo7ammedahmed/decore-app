import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import PublicImage from '@/Components/PublicImage';
import PublicBreadcrumbs from '@/Components/PublicBreadcrumbs';
import PublicMaterialCard from '@/Components/PublicMaterialCard';
import { fadeUp, fadeUpTransition, staggerContainer } from '@/Utilities/motion';
import { money, unitLabel } from '@/Utilities/format';
import { useI18n } from '@/Utilities/i18n';
import type { PublicMaterial, ShopProfile } from '@/types/domain';
import type { PageProps } from '@/types';

interface MaterialShowProps extends PageProps {
    material: PublicMaterial;
    currency: string;
    related: PublicMaterial[];
}

/** WhatsApp href — full URL passes through, bare numbers become wa.me/<digits>. */
function waHref(whatsapp: string): string {
    const value = whatsapp.trim();
    if (/^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : value;
}

export default function MaterialShow({ material, currency, related }: MaterialShowProps) {
    const { t, locale } = useI18n();
    const { props } = usePage();
    const profile = (props.profile as ShopProfile | undefined) ?? null;
    const name = material.localized_name ?? material.name_en;
    const classification = material.classification?.localized_name ?? material.classification?.name_en;
    const whatsapp = profile?.whatsapp?.trim() || '';
    const email = profile?.email?.trim() || '';

    const quoteHref = whatsapp
        ? waHref(whatsapp)
        : `mailto:${email}?subject=${encodeURIComponent(`${t('show.quote_cta')} — ${name}`)}`;

    return (
        <PublicLayout title={name}>
            <Head>
                <meta name="description" content={material.description ?? name} />
                <meta property="og:title" content={name} />
                <meta property="og:description" content={material.description ?? name} />
                {material.image_url && <meta property="og:image" content={material.image_url} />}
            </Head>

            <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
                <PublicBreadcrumbs
                    items={[
                        { label: t('show.breadcrumb_home'), href: '/' },
                        { label: t('show.breadcrumb_catalog'), href: route('catalog') },
                        ...(material.classification
                            ? [{ label: classification ?? '', href: route('catalog', { classification: material.classification_id }) }]
                            : []),
                        { label: name },
                    ]}
                />

                <motion.div
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    transition={fadeUpTransition}
                    className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14"
                >
                    {/* Visual — the finish is the focus */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                            <PublicImage
                                src={material.image_url}
                                alt={material.image_alt_text ?? name}
                                label={name}
                                eager
                                className="aspect-[4/5] w-full object-cover"
                            />
                        </div>
                        {material.image_alt_text && (
                            <p className="mt-3 text-xs text-fg/35">{material.image_alt_text}</p>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            {material.sku && (
                                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                                    {t('show.sku_label')}: {material.sku}
                                </span>
                            )}
                            {material.supplier && (
                                <span className="rounded-full border border-line px-3 py-1 text-xs text-fg/45">
                                    {t('show.supplied_by', { name: material.supplier.name })}
                                </span>
                            )}
                        </div>

                        <h1 className="mt-4 font-heading text-5xl italic leading-[1.02] tracking-[-0.02em] sm:text-6xl">
                            {name}
                        </h1>

                        {classification && (
                            <Link
                                href={route('catalog', { classification: material.classification_id })}
                                className="mt-3 inline-block text-sm text-fg/50 underline-offset-4 transition-colors hover:text-accent hover:underline"
                            >
                                {t('show.collection_label')}: {classification}
                            </Link>
                        )}

                        {material.description && (
                            <>
                                <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-fg/40">
                                    {t('show.overview_label')}
                                </h2>
                                <p className="mt-3 leading-relaxed text-fg/60">{material.description}</p>
                            </>
                        )}

                        <div className="mt-8 flex flex-wrap items-baseline gap-3 border-t border-line pt-6">
                            <span className="font-heading text-5xl italic text-accent">
                                {money(material.selling_price, currency)}
                            </span>
                            <span className="text-sm text-fg/45">
                                {t('show.per_unit', { unit: unitLabel(material.unit, locale) })}
                            </span>
                        </div>

                        {/* Contact / quote CTAs */}
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <a
                                href={quoteHref}
                                target={whatsapp ? '_blank' : undefined}
                                rel={whatsapp ? 'noopener noreferrer' : undefined}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-on-accent transition-opacity duration-200 hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                            >
                                {whatsapp ? t('show.whatsapp_cta') : t('show.quote_cta')}
                                <svg className="h-4 w-4 rtl:-scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </a>
                            <Link
                                href={route('contact')}
                                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm font-medium text-fg/70 transition-colors hover:border-fg/40 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
                            >
                                {t('nav.contact')}
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Related finishes */}
                {related.length > 0 && (
                    <section className="mt-24">
                        <div className="flex items-end justify-between gap-6">
                            <div className="max-w-xl">
                                <h2 className="font-heading text-3xl italic text-fg sm:text-4xl">{t('show.related_title')}</h2>
                                <p className="mt-3 text-sm text-fg/50">{t('show.related_sub')}</p>
                            </div>
                            <Link
                                href={route('catalog', { classification: material.classification_id })}
                                className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-fg/60 transition-colors hover:text-fg sm:inline-flex"
                            >
                                {t('common.view_all')}
                                <svg className="h-4 w-4 rtl:-scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </Link>
                        </div>

                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={staggerContainer}
                            className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            {related.map((item) => (
                                <PublicMaterialCard key={item.id} material={item} />
                            ))}
                        </motion.div>
                    </section>
                )}
            </section>
        </PublicLayout>
    );
}
