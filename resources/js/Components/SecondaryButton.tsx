import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

const SecondaryButton = forwardRef<
    HTMLButtonElement,
    ButtonHTMLAttributes<HTMLButtonElement>
>(({ type = 'button', className = '', disabled, children, ...props }, ref) => {
    return (
        <button
            {...props}
            type={type}
            className={`liquid-glass inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/[0.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
            disabled={disabled}
            ref={ref}
        >
            {children}
        </button>
    );
});

export default SecondaryButton;
