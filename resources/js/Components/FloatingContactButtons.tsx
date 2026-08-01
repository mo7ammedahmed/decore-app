import { motion } from 'framer-motion';
import { fadeUp, fadeUpTransition } from '@/Utilities/motion';
import { useI18n } from '@/Utilities/i18n';
import type { ShopProfile } from '@/types/domain';

/** `tel:` href — keep only digits, with a single leading + when present. */
function telHref(phone: string): string {
    const trimmed = phone.trim();
    const digits = trimmed.replace(/\D/g, '');
    return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`;
}

/**
 * WhatsApp href. The dashboard stores a full URL (validated as `url`), but a
 * bare phone number is tolerated too — it is converted to wa.me/<digits>.
 */
function waHref(whatsapp: string): string {
    const value = whatsapp.trim();
    if (/^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : value;
}

interface Props {
    profile: ShopProfile | null;
}

/**
 * Floating contact actions for the visitor site — a WhatsApp bubble and a call
 * button anchored to the bottom edge. They only render when the corresponding
 * field is configured on the Profile settings page (admin).
 */
export default function FloatingContactButtons({ profile }: Props) {
    const { t } = useI18n();
    const phone = profile?.phone?.trim() || '';
    const whatsapp = profile?.whatsapp?.trim() || '';

    if (!phone && !whatsapp) return null;

    return (
        <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={fadeUpTransition}
            className="fixed bottom-5 end-4 z-50 flex flex-col items-center gap-3"
        >
            {whatsapp && (
                <a
                    href={waHref(whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('fab.whatsapp')}
                    title={t('fab.whatsapp')}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
                >
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </a>
            )}
            {phone && (
                <a
                    href={telHref(phone)}
                    aria-label={t('fab.call')}
                    title={t('fab.call')}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-canvas shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
                >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                </a>
            )}
        </motion.div>
    );
}
