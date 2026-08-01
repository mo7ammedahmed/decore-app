import type { Variants } from 'framer-motion';

/**
 * Shared liquid-glass entrance pattern defined in the design spec.
 * Deliberately not typed as Variants so `fadeUp.initial` is assignable
 * to motion's `initial`/`animate` props.
 */
export const fadeUp = {
    initial: {
        filter: 'blur(10px)',
        opacity: 0,
        y: 20,
    },
    animate: {
        filter: 'blur(0px)',
        opacity: 1,
        y: 0,
    },
} as const;

export const fadeUpTransition = { duration: 0.8, ease: 'easeOut' } as const;

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
        filter: 'blur(6px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};
