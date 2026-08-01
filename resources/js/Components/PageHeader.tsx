import { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, fadeUpTransition } from '@/Utilities/motion';

export default function PageHeader({
    title,
    description,
    children,
}: PropsWithChildren<{ title: string; description?: string }>) {
    return (
        <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={fadeUpTransition}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
            <div>
                <h1 className="text-4xl">{title}</h1>
                {description && (
                    <p className="mt-2 max-w-xl text-sm text-white/50">{description}</p>
                )}
            </div>
            {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
        </motion.div>
    );
}
