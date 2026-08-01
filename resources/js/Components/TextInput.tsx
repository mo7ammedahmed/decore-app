import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ className = '', isFocused = false, ...props }, ref) => {
        const internalRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => internalRef.current as HTMLInputElement, []);

        useEffect(() => {
            if (isFocused) {
                internalRef.current?.focus();
            }
        }, [isFocused]);

        return <input {...props} className={`form-input ${className}`} ref={internalRef} />;
    },
);

export default TextInput;
