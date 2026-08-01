import { PropsWithChildren } from 'react';

interface GlassCardProps {
    className?: string;
    strong?: boolean;
    as?: 'div' | 'section' | 'article';
}

export default function GlassCard({
    children,
    className = '',
    strong = false,
    as: Tag = 'div',
}: PropsWithChildren<GlassCardProps>) {
    return (
        <Tag className={`${strong ? 'liquid-glass-strong' : 'liquid-glass'} rounded-card ${className}`}>
            {children}
        </Tag>
    );
}
