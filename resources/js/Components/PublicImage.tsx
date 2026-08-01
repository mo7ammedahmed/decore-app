import { useState } from 'react';

interface PublicImageProps {
    src?: string | null;
    alt: string;
    /** Small label (e.g. an initial) shown on the texture fallback. */
    label?: string;
    /** Eager-load the hero image; everything else defaults to lazy. */
    eager?: boolean;
    className?: string;
}

/**
 * Showroom image with a warm architectural fallback. When no image exists (or
 * the URL fails to load) a layered material texture renders instead of a
 * broken image — the guest experience never depends on an uploaded file.
 */
export default function PublicImage({ src, alt, label, eager = false, className = '' }: PublicImageProps) {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;

    if (showFallback) {
        return (
            <div role="img" aria-label={alt} className={`material-texture flex items-center justify-center ${className}`}>
                {label && (
                    <span className="font-heading text-5xl italic text-fg/15">{label.charAt(0).toUpperCase()}</span>
                )}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            onError={() => setFailed(true)}
            className={className}
        />
    );
}
