import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '@/Utilities/i18n';

export interface LightboxItem {
    id: number;
    image_url?: string | null;
    alt_text?: string | null;
    caption: string;
}

interface GalleryLightboxProps {
    items: LightboxItem[];
    /** Index of the image that should open first. */
    startIndex: number;
    open: boolean;
    onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

/**
 * Fullscreen image viewer for the public gallery. Supports keyboard
 * navigation (←/→, Esc), horizontal touch swipes, prev/next arrows, a
 * position counter, body-scroll locking, and a lightweight focus trap.
 * Navigation is mirrored for RTL locales so the physical direction of the
 * gesture always matches the reading direction.
 */
export default function GalleryLightbox({ items, startIndex, open, onClose }: GalleryLightboxProps) {
    const { t, dir } = useI18n();
    const flip = dir === 'rtl' ? -1 : 1;
    const total = items.length;

    /**
     * Direction-aware slide variants. `nav` is the latest navigation direction
     * passed via `custom` — AnimatePresence forwards its own `custom` to
     * exiting children, so the outgoing image always slides out the opposite
     * side of the incoming one, even when the user alternates next/prev.
     * `flip` mirrors the whole motion for RTL.
     */
    const imageVariants = {
        enter: (nav: number) => ({ opacity: 0, x: nav * flip * 56, scale: 0.98 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (nav: number) => ({ opacity: 0, x: nav * flip * -56, scale: 0.98 }),
    };

    const [index, setIndex] = useState(startIndex);
    const [direction, setDirection] = useState(1);
    const dialogRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    // Defensively clamp in case items shrink while the viewer is open (e.g. a
    // partial reload swaps the section list under us).
    const safeIndex = Math.min(Math.max(index, 0), Math.max(total - 1, 0));
    const current = items[safeIndex];

    // Jump to the clicked image and remember the previously focused element so
    // focus can be restored when the viewer closes.
    useEffect(() => {
        if (!open) return;
        setIndex(startIndex);
        setDirection(1);
        const previouslyFocused = document.activeElement as HTMLElement | null;
        dialogRef.current?.focus();
        return () => {
            previouslyFocused?.focus();
        };
    }, [open, startIndex]);

    // Lock page scroll while the viewer is open.
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    const next = useCallback(() => {
        if (total === 0) return;
        setDirection(1);
        setIndex((i) => (i + 1) % total);
    }, [total]);

    const previous = useCallback(() => {
        if (total === 0) return;
        setDirection(-1);
        setIndex((i) => (i - 1 + total) % total);
    }, [total]);

    // Keyboard navigation + focus trap. Arrow meaning flips in RTL so the key
    // that points "forward" in the reading direction always advances.
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }
            if (e.key === 'Tab') {
                const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
                if (!focusables || focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
                return;
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (dir === 'rtl') previous();
                else next();
                return;
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (dir === 'rtl') next();
                else previous();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, dir, next, previous, onClose]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        if (dir === 'rtl') {
            if (delta > 0) next();
            else previous();
        } else {
            if (delta < 0) next();
            else previous();
        }
    };

    return (
        <AnimatePresence>
            {open && total > 0 && current && (
                <motion.div
                    key="lightbox"
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('gallery.title')}
                    tabIndex={-1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm focus:outline-none"
                >
                    {/* Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('gallery.lightbox_close')}
                        className="absolute end-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full liquid-glass-strong text-white/80 transition-all duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>

                    {/* Previous — sits on the "start" side, mirrors in RTL */}
                    {total > 1 && (
                        <button
                            type="button"
                            onClick={previous}
                            aria-label={t('gallery.lightbox_previous')}
                            className="absolute start-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full liquid-glass-strong text-white/80 transition-all duration-200 hover:scale-105 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:start-5"
                        >
                            <svg className="h-5 w-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 6l-6 6 6 6" />
                            </svg>
                        </button>
                    )}

                    {/* Next — sits on the "end" side, mirrors in RTL */}
                    {total > 1 && (
                        <button
                            type="button"
                            onClick={next}
                            aria-label={t('gallery.lightbox_next')}
                            className="absolute end-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full liquid-glass-strong text-white/80 transition-all duration-200 hover:scale-105 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:end-5"
                        >
                            <svg className="h-5 w-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 6l6 6-6 6" />
                            </svg>
                        </button>
                    )}

                    {/* Image */}
                    <div className="relative flex h-full w-full items-center justify-center px-14 sm:px-20">
                        <AnimatePresence custom={direction} initial={false}>
                            <motion.img
                                key={current.id}
                                src={current.image_url ?? undefined}
                                alt={current.alt_text ?? current.caption}
                                custom={direction}
                                variants={imageVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                                className="absolute inset-0 m-auto max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
                                draggable={false}
                            />
                        </AnimatePresence>
                    </div>

                    {/* Caption + counter */}
                    <div className="pointer-events-none absolute bottom-5 inset-x-0 z-10 flex flex-col items-center gap-1.5 px-6 text-center">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.p
                                key={current.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-xl text-sm text-white/70"
                            >
                                {current.alt_text ?? current.caption}
                            </motion.p>
                        </AnimatePresence>
                        <p aria-live="polite" className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/40">
                            {t('gallery.lightbox_counter', { current: safeIndex + 1, total })}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
