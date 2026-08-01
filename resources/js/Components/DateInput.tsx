import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

const DateInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className = '', type = 'date', ...props }, ref) => {
        return <input type={type} className={`form-input ${className}`} ref={ref} {...props} />;
    },
);

export default DateInput;
