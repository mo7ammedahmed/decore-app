import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface GlassButtonProps {
    href?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    variant?: Variant;
    className?: string;
    disabled?: boolean;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: 'button' | 'link';
}

const VARIANTS: Record<Variant, string> = {
    primary: 'liquid-glass-strong text-white hover:bg-white/[0.07]',
    secondary: 'liquid-glass text-white/80 hover:text-white hover:bg-white/[0.05]',
    danger: 'border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
    ghost: 'text-white/60 hover:bg-white/[0.05] hover:text-white',
};

export default function GlassButton({
    children,
    href,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    method = 'get',
    as = 'button',
}: PropsWithChildren<GlassButtonProps>) {
    const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`;

    if (as === 'link' || (href && method === 'get')) {
        return (
            <Link href={href ?? '#'} method={method} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={classes}>
            {children}
        </button>
    );
}
