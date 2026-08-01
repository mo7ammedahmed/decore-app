import { Children, PropsWithChildren, ReactElement, cloneElement, isValidElement, useId } from 'react';
import InputError from '@/Components/InputError';

interface FormFieldProps {
    label?: string;
    error?: string;
    required?: boolean;
    hint?: string;
    className?: string;
    htmlFor?: string;
}

export default function FormField({
    label,
    error,
    required = false,
    hint,
    className = '',
    htmlFor,
    children,
}: PropsWithChildren<FormFieldProps>) {
    // Unique ids so the control can be associated with its hint/error via
    // aria-describedby (and aria-invalid when validation fails).
    const hintId = useId();
    const errorId = useId();

    const describedBy =
        [hint && !error ? hintId : null, error ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined;

    // Inject the association into the single child control when present.
    let control = children;
    if (Children.count(children) === 1 && isValidElement(children)) {
        control = cloneElement(children as ReactElement, {
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
        });
    }

    return (
        <div className={className}>
            {label && (
                <label htmlFor={htmlFor} className="form-label">
                    {label}
                    {required && <span className="ml-1 text-accent">*</span>}
                </label>
            )}
            {control}
            {hint && !error && (
                <p id={hintId} className="mt-1.5 text-xs text-white/35">
                    {hint}
                </p>
            )}
            {error && <InputError id={errorId}>{error}</InputError>}
        </div>
    );
}
