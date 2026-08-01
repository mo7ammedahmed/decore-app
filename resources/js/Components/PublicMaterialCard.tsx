import { Link } from '@inertiajs/react';
import type { PublicMaterial } from '@/types/domain';
import { money, unitLabel } from '@/Utilities/format';
import PublicImage from '@/Components/PublicImage';
import { motion } from 'framer-motion';
import { staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';

/**
 * Showroom product card — the image dominates, followed by the collection,
 * the finish name and the per-unit price. The whole card is a link; hover
 * gently scales the photo. Falls back to a warm texture when no image exists.
 */
export default function PublicMaterialCard({ material }: { material: PublicMaterial }) {
    const { t, locale } = useI18n();
    const name = material.localized_name ?? material.name_en;
    const classification = material.classification?.localized_name ?? material.classification?.name_en;

    return (
        <motion.div variants={staggerItem}>
            <Link
                href={route('catalog.show', material.slug)}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-2xl"
            >
                <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
                    <PublicImage
                        src={material.image_url}
                        alt={material.image_alt_text ?? name}
                        label={name}
                        className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    {classification && (
                        <span className="absolute start-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                            {classification}
                        </span>
                    )}
                </div>

                <div className="mt-4 px-1">
                    <h3 className="font-heading text-xl italic leading-snug text-fg transition-colors group-hover:text-accent">
                        {name}
                    </h3>
                    <div className="mt-2 flex items-baseline justify-between gap-3">
                        <p className="text-sm text-fg/70">
                            <span className="text-[11px] uppercase tracking-[0.14em] text-fg/35">{t('pmc.from')} </span>
                            <span className="font-medium text-accent">{money(material.selling_price, material.currency_code)}</span>
                            <span className="text-fg/40"> / {unitLabel(material.unit, locale)}</span>
                        </p>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-fg/50 transition-colors group-hover:text-accent">
                            {t('pmc.view')}
                            <svg className="h-3.5 w-3.5 rtl:-scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
