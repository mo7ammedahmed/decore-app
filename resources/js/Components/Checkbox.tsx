import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className = '', ...props }, ref) => {
        return (
            <input
                type="checkbox"
                className={`h-4 w-4 rounded border-white/20 bg-white/5 text-accent shadow-none focus:ring-accent/40 focus:ring-offset-0 ${className}`}
                ref={ref}
                {...props}
            />
        );
    },
);

export default Checkbox;
