interface StatusBadgeProps {
    label: string;
    tone?: string;
    dot?: boolean;
}

export default function StatusBadge({ label, tone = 'bg-white/[0.06] text-white/60', dot = true }: StatusBadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${tone}`}>
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
            {label}
        </span>
    );
}
