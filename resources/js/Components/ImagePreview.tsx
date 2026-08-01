interface ImagePreviewProps {
    url?: string | null;
    hex?: string | null;
    alt?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
    sm: 'h-10 w-10 rounded-lg',
    md: 'h-16 w-16 rounded-xl',
    lg: 'h-28 w-28 rounded-2xl',
};

export default function ImagePreview({ url, hex, alt = 'Color', className = '', size = 'md' }: ImagePreviewProps) {
    return (
        <div
            className={`${SIZES[size]} flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white/[0.03] ${className}`}
        >
            {url ? (
                <img src={url} alt={alt} className="h-full w-full object-cover" />
            ) : hex ? (
                <span
                    className="h-full w-full"
                    style={{ backgroundColor: hex }}
                    aria-label={`${alt} — ${hex}`}
                />
            ) : (
                <svg className="h-1/2 w-1/2 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 7l-5-6-4 5-3-3-4 4" />
                </svg>
            )}
        </div>
    );
}
