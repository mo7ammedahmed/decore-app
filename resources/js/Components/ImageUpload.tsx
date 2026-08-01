import { useRef, useState } from 'react';
import type { DragEvent } from 'react';

interface ImageUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    existingUrl?: string | null;
    altText?: string;
    disabled?: boolean;
    /** Max file size in MB — defaults to 2MB, gallery uploads use 8MB. */
    maxSizeMb?: number;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2MB

export default function ImageUpload({
    value,
    onChange,
    error,
    existingUrl,
    altText,
    disabled = false,
    maxSizeMb = 2,
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const maxSize = maxSizeMb * 1024 * 1024;

    const acceptFile = (file: File | undefined | null) => {
        setLocalError(null);

        if (!file) return;

        if (!ACCEPTED.includes(file.type)) {
            setLocalError('Only JPEG, PNG and WebP images are accepted.');
            return;
        }

        if (file.size > maxSize) {
            setLocalError(`Image must be ${maxSizeMb}MB or smaller.`);
            return;
        }

        onChange(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOver(false);
        acceptFile(event.dataTransfer.files?.[0]);
    };

    const clear = () => {
        onChange(null);
        setPreview(null);
        setLocalError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const shownError = localError ?? error;

    return (
        <div>
            <div
                role="button"
                tabIndex={0}
                aria-label={existingUrl || preview ? 'Replace image' : 'Upload image'}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`liquid-glass group flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed p-6 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    dragOver ? 'border-accent/60 bg-accent/5' : 'border-white/15'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                    disabled={disabled}
                />

                {preview || existingUrl ? (
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src={preview ?? existingUrl ?? undefined}
                            alt={altText ?? 'Preview'}
                            className="max-h-40 rounded-xl object-contain shadow-lg"
                        />
                        <p className="text-xs text-white/45 group-hover:text-white/70">
                            Click or drop a file to replace
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="liquid-glass-strong flex h-12 w-12 items-center justify-center rounded-full">
                            <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-14-2V5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                                <circle cx="8.5" cy="7.5" r="1.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white/75">
                                Drag &amp; drop an image here
                            </p>
                            <p className="mt-1 text-xs text-white/35">
                                or click to browse · JPEG, PNG, WebP · max {maxSizeMb}MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {(preview || existingUrl) && !disabled && (
                <button
                    type="button"
                    onClick={clear}
                    className="mt-2 text-xs font-medium text-danger/80 transition-colors hover:text-danger"
                >
                    Remove image
                </button>
            )}

            {shownError && <p className="field-error">{shownError}</p>}
        </div>
    );
}
