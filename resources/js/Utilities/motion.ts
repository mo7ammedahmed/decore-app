import type { Variants } from 'framer-motion';

/**
 * Shared liquid-glass entrance pattern defined in the design spec.
 * Deliberately not typed as Variants so `fadeUp.initial` is assignable
 * to motion's `initial`/`animate` props.
 */
export const fadeUp = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
} as const;

export const fadeUpTransition = { duration: 0.4, ease: 'easeOut' } as const;

/**
 * Stagger container for lists — children opt in with item variants.
 */
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
};

export const staggerItem: Variants = {
    initial: {
        opacity: 0,
        y: 14,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut' },
    },
};
