import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

interface InputErrorProps extends HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

const InputError = forwardRef<HTMLParagraphElement, InputErrorProps>(
    ({ className = '', message, children, ...props }, ref) => {
        // role="alert" must be present BEFORE the error text arrives, or the
        // live region never forms and the announcement is missed (the element
        // is always rendered by pages like DeleteUserForm). Empty alert
        // regions are ignored by assistive technology.
        return (
            <p {...props} role="alert" className={`field-error ${className}`} ref={ref}>
                {message ?? children}
            </p>
        );
    },
);

export default InputError;
