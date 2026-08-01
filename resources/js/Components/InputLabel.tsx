import { forwardRef } from 'react';
import type { LabelHTMLAttributes } from 'react';

interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    value?: string;
}

const InputLabel = forwardRef<HTMLLabelElement, InputLabelProps>(
    ({ className = '', value, children, ...props }, ref) => {
        return (
            <label {...props} className={`form-label ${className}`} ref={ref}>
                {value ?? children}
            </label>
        );
    },
);

export default InputLabel;
