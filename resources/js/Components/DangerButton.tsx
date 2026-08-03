import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

const DangerButton = forwardRef<
    HTMLButtonElement,
    ButtonHTMLAttributes<HTMLButtonElement>
>(({ type = 'button', className = '', disabled, children, ...props }, ref) => {
    return (
        <button
            {...props}
            type={type}
            className={`inline-flex items-center justify-center rounded-full border border-danger/30 bg-danger/10 px-5 py-2.5 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
            disabled={disabled}
            ref={ref}
        >
            {children}
        </button>
    );
});

export default DangerButton;
