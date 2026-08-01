import { PropsWithChildren } from 'react';

export default function EmptyState({
    title,
    description,
    icon = 'inbox',
    children,
}: PropsWithChildren<{ title: string; description?: string; icon?: string }>) {
    const ICONS: Record<string, string> = {
        inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
        image: 'M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 7l-5-6-4 5-3-3-4 4',
        file: 'M9 12h6m-6 4h6m-8-8h2M5 3h9l5 5v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z',
    };

    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="liquid-glass flex h-14 w-14 items-center justify-center rounded-full">
                <svg className="h-6 w-6 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[icon] ?? ICONS.inbox} />
                </svg>
            </div>
            <h3 className="mt-4 font-heading text-xl italic text-white/80">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-sm text-white/40">{description}</p>}
            {children}
        </div>
    );
}
