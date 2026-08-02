import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useI18n } from '@/Utilities/i18n';
import type { TranslationKey } from '@/Utilities/i18n';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const { t } = useI18n();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [kind, setKind] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const next = flash?.success ?? flash?.error ?? null;

        if (next) {
            // Keep the raw value; translate at render time so the toast stays
            // in sync with the active locale without re-arming the timer.
            setMessage(next);
            setKind(flash?.success ? 'success' : 'error');
            setVisible(true);

            const timer = window.setTimeout(() => setVisible(false), 4500);

            return () => window.clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
            <AnimatePresence>
                {visible && message && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        role="status"
                        className={`liquid-glass-strong pointer-events-auto flex max-w-lg items-center gap-3 rounded-full px-5 py-3 text-sm font-medium ${
                            kind === 'success' ? 'text-success' : 'text-danger'
                        }`}
                    >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
                        <span className="text-fg/85">
                            {/* Flashes may be translation keys ('tax.deleted') or legacy
                                raw strings — translate() falls back to the raw value
                                when the key is unknown, so both render correctly. */}
                            {message ? t(message as TranslationKey) : ''}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
