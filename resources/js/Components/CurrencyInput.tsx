import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode' | 'step'> {
    step?: string;
    currency?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className = '', step = '0.01', min = '0', currency, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    type="number"
                    inputMode="decimal"
                    step={step}
                    min={min}
                    className={`form-input pr-9 ${className}`}
                    ref={ref}
                    {...props}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/35">
                    {currency ?? ''}
                </span>
            </div>
        );
    },
);

export default CurrencyInput;
