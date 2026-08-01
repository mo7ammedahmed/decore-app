interface PublicSectionHeadingProps {
    eyebrow?: string;
    title: string;
    sub?: string;
    align?: 'start' | 'center';
    /** Semantic level — pass "h1" for the page's primary heading. */
    level?: 'h1' | 'h2';
    className?: string;
}

/**
 * Editorial section header used across the public site: a small tracked
 * eyebrow, a large serif title and an optional subtitle. Alignment follows the
 * reading direction (start) unless the section is intentionally centered.
 */
export default function PublicSectionHeading({
    eyebrow,
    title,
    sub,
    align = 'start',
    level = 'h2',
    className = '',
}: PublicSectionHeadingProps) {
    const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-start';
    const TitleTag = level === 'h1' ? 'h1' : 'h2';
    const titleClass = `mt-3 font-heading text-4xl italic leading-[1.05] tracking-[-0.02em] text-fg sm:text-5xl ${
        level === 'h1' ? 'text-5xl sm:text-6xl' : ''
    }`;

    return (
        <div className={`max-w-2xl ${alignClass} ${className}`}>
            {eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
            )}
            <TitleTag className={titleClass}>{title}</TitleTag>
            {sub && <p className="mt-4 text-sm font-light leading-relaxed text-fg/55 md:text-base">{sub}</p>}
        </div>
    );
}
