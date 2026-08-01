import { Link } from '@inertiajs/react';
import type { PublicMaterial } from '@/types/domain';
import { money, unitLabel } from '@/Utilities/format';
import ImagePreview from '@/Components/ImagePreview';
import { motion } from 'framer-motion';
import { staggerItem } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';

export default function PublicMaterialCard({ material }: { material: PublicMaterial }) {
    const { t, locale } = useI18n();
    const firstImage = material.image_url ?? null;

    return (
        <motion.div variants={staggerItem}>
            <Link
                href={route('catalog.show', material.slug)}
                className="liquid-glass group block rounded-[1.25rem] p-5 transition-all duration-300 hover:bg-fg/[0.03]"
            >
                <div className="flex items-start gap-4">
                    <ImagePreview url={firstImage} hex={null} alt={material.localized_name ?? material.name_en} size="lg" />
                    <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-xl italic leading-snug text-fg/90 group-hover:text-fg">
                            {material.localized_name ?? material.name_en}
                        </h3>
                        <p className="mt-0.5 text-xs text-fg/35">
                            {material.classification?.localized_name ?? material.classification?.name_en ?? '—'} · {unitLabel(material.unit, locale)}
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-fg/35">{t('pmc.from')}</p>
                        <p className="mt-1 text-accent">
                            {money(material.selling_price, material.currency_code)}
                        </p>
                    </div>
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-fg/50 transition-colors duration-200 group-hover:border-accent/40 group-hover:text-accent">
                        {t('pmc.view')} <span className="inline-block rtl:-scale-x-100">→</span>
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}
