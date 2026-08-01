import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = '', rows = 3, ...props }, ref) => {
        return <textarea className={`form-textarea ${className}`} rows={rows} ref={ref} {...props} />;
    },
);

export default Textarea;
