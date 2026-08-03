import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

const PrimaryButton = forwardRef<
    HTMLButtonElement,
    ButtonHTMLAttributes<HTMLButtonElement>
>(({ className = '', disabled, children, ...props }, ref) => {
    return (
        <button
            {...props}
            className={`liquid-glass-strong inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
            disabled={disabled}
            ref={ref}
        >
            {children}
        </button>
    );
});

export default PrimaryButton;
