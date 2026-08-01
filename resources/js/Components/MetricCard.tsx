import { motion } from 'framer-motion';
import { fadeUp, fadeUpTransition } from '@/Utilities/motion';
import { PropsWithChildren } from 'react';

interface MetricCardProps {
    label: string;
    value: string;
    hint?: string;
    tone?: 'default' | 'accent' | 'success' | 'danger' | 'info';
    icon?: string;
}

const TONES = {
    default: 'text-white/90',
    accent: 'text-accent',
    success: 'text-success',
    danger: 'text-danger',
    info: 'text-info',
};

export default function MetricCard({ label, value, hint, tone = 'default', icon }: PropsWithChildren<MetricCardProps>) {
    return (
        <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUpTransition}>
            <div className="liquid-glass rounded-[1.25rem] p-5 transition-colors duration-300 hover:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{label}</p>
                    {icon && (
                        <svg className="h-4 w-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                            <path d={icon} />
                        </svg>
                    )}
                </div>
                <p className={`mt-3 font-heading text-3xl italic tracking-tight ${TONES[tone]}`}>{value}</p>
                {hint && <p className="mt-1.5 text-xs text-white/35">{hint}</p>}
            </div>
        </motion.div>
    );
}
