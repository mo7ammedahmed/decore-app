import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, fadeUpTransition } from '@/Utilities/motion';
import FlashMessage from '@/Components/FlashMessage';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useI18n } from '@/Utilities/i18n';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { props } = usePage();
    const shop = props.shop ?? null;
    const shopName = shop?.shop_name || 'Decore';
    const { t } = useI18n();

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
            <div className="absolute end-4 top-4">
                <LanguageSwitcher />
            </div>

            <motion.div
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={fadeUpTransition}
                className="w-full max-w-md"
            >
                <div className="mb-10 flex flex-col items-center text-center">
                    <Link href="/" className="liquid-glass-strong flex h-14 w-14 items-center justify-center overflow-hidden rounded-full">
                        {shop?.logo_url ? (
                            <img src={shop.logo_url} alt={shopName} className="h-14 w-14 rounded-full object-cover" />
                        ) : (
                            <span className="font-heading text-2xl italic text-accent">{shopName.charAt(0).toUpperCase()}</span>
                        )}
                    </Link>
                    <h1 className="mt-5 font-heading text-4xl italic text-white">{shopName}</h1>
                    <p className="mt-2 text-sm text-white/45">{shop?.tagline ?? t('guest.tagline')}</p>
                </div>

                <div className="liquid-glass-strong rounded-modal p-8">{children}</div>
            </motion.div>

            <FlashMessage />
        </div>
    );
}
