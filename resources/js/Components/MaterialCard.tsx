import { Link } from '@inertiajs/react';
import type { Material } from '@/types/domain';
import { money, unitLabel } from '@/Utilities/format';
import ImagePreview from '@/Components/ImagePreview';
import StatusBadge from '@/Components/StatusBadge';
import { motion } from 'framer-motion';
import { staggerItem } from '@/Utilities/motion';

export default function MaterialCard({ material }: { material: Material }) {
    const firstImage = material.image_url ?? null;
    const firstHex = null;
    const lowStock =
        material.stock_quantity !== null &&
        material.minimum_stock_level !== null &&
        material.stock_quantity <= material.minimum_stock_level;

    return (
        <motion.div variants={staggerItem}>
            <Link
                href={route('materials.show', material.id)}
                className="liquid-glass group block rounded-[1.25rem] p-5 transition-all duration-300 hover:bg-white/[0.03]"
            >
                <div className="flex items-start gap-4">
                    <ImagePreview url={firstImage} hex={firstHex} alt={material.localized_name ?? material.name_en} size="lg" />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-heading text-xl italic leading-snug text-white/90 group-hover:text-white">
                                {material.localized_name ?? material.name_en}
                            </h3>
                            <StatusBadge
                                label={material.is_active ? 'Active' : 'Archived'}
                                tone={material.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                                dot={false}
                            />
                        </div>
                        <p className="mt-0.5 text-xs text-white/35">
                            {material.sku} · {material.supplier?.name ?? '—'} · {unitLabel(material.unit)}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">Price</p>
                        <p className="mt-1 text-white/85">{money(material.selling_price, material.currency_code)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">SKU</p>
                        <p className="mt-1 truncate text-white/85">{material.sku}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">Stock</p>
                        <p className={`mt-1 ${lowStock ? 'text-danger' : 'text-white/85'}`}>
                            {material.stock_quantity ?? '—'}
                            {lowStock && <span className="ml-1 text-xs">low</span>}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
