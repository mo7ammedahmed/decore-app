import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: SelectOption[] | Record<string, string>;
    placeholder?: string;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
    ({ className = '', options, placeholder, ...props }, ref) => {
        const normalized: SelectOption[] = Array.isArray(options)
            ? options
            : Object.entries(options).map(([value, label]) => ({ value, label }));

        return (
            <select className={`form-select ${className}`} ref={ref} {...props}>
                {placeholder !== undefined && (
                    <option value="" className="bg-neutral-900">
                        {placeholder}
                    </option>
                )}
                {normalized.map((option) => (
                    <option key={option.value} value={option.value} className="bg-neutral-900">
                        {option.label}
                    </option>
                ))}
            </select>
        );
    },
);

export default SelectInput;
