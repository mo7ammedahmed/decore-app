import PublicLayout from '@/Layouts/PublicLayout';
import ImagePreview from '@/Components/ImagePreview';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from '@/Utilities/motion';
import { money, unitLabel } from '@/Utilities/format';
import { useI18n } from '@/Utilities/i18n';
import type { PublicMaterial } from '@/types/domain';
import type { PageProps } from '@/types';

interface MaterialShowProps extends PageProps {
    material: PublicMaterial;
    currency: string;
}

export default function MaterialShow({ material, currency }: MaterialShowProps) {
    const { t, locale } = useI18n();
    const heroImage = material.image_url ?? null;
    const heroHex = null;

    return (
        <PublicLayout title={material.localized_name ?? material.name_en}>
            <section className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6">
                <Link
                    href={route('catalog')}
                    className="inline-flex items-center gap-2 text-sm text-fg/50 transition-colors hover:text-fg"
                >
                    <span className="inline-block rtl:-scale-x-100">←</span>
                    {t('show.back')}
                </Link>

                <motion.div
                    initial={fadeUp.initial}
                    animate={fadeUp.animate}
                    transition={fadeUpTransition}
                    className="mt-8 grid gap-10 lg:grid-cols-2"
                >
                    {/* Visual */}
                    <div>
                        <div className="liquid-glass-strong overflow-hidden rounded-modal">
                            <ImagePreview
                                url={heroImage}
                                hex={heroHex}
                                alt={material.localized_name ?? material.name_en}
                                size="lg"
                                className="!h-80 !w-full !rounded-none"
                            />
                        </div>
                        {material.image_alt_text && (
                            <p className="mt-3 text-xs text-fg/35">{material.image_alt_text}</p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-fg/40">
                            {material.supplier && (
                                <span>{t('show.supplied_by', { name: material.supplier.name })}</span>
                            )}
                            {material.classification && (
                                <>
                                    <span className="text-fg/20">·</span>
                                    <Link
                                        href={route('catalog', { classification: material.classification_id })}
                                        className="text-accent transition-colors hover:text-accent"
                                    >
                                        {material.classification.localized_name ?? material.classification.name_en}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                            {material.sku}
                        </p>
                        <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">{material.localized_name ?? material.name_en}</h1>

                        {material.description && (
                            <p className="mt-6 text-fg/55">{material.description}</p>
                        )}

                        <div className="mt-8 flex flex-wrap items-baseline gap-3">
                            <span className="font-heading text-4xl italic text-accent">
                                {money(material.selling_price, currency)}
                            </span>
                            <span className="text-sm text-fg/40">
                                {t('show.per_unit', { unit: unitLabel(material.unit, locale) })}
                            </span>
                        </div>

                        <div className="mt-10 border-t border-line pt-6">
                            <p className="text-sm leading-relaxed text-fg/40">
                                {t('show.interested')}{' '}
                                <Link href={route('contact')} className="text-accent transition-colors hover:text-accent-hover">
                                    {t('nav.contact')}
                                </Link>{' '}
                                {t('show.quote', { supplier: material.supplier?.name ?? t('nav.suppliers') })}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
