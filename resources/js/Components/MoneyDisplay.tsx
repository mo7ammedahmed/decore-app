import { money } from '@/Utilities/format';

interface MoneyDisplayProps {
    value: string | number | null | undefined;
    currency?: string | null;
    className?: string;
    tone?: 'default' | 'danger' | 'success' | 'muted' | 'accent';
}

const TONES = {
    default: 'text-white/85',
    danger: 'text-danger',
    success: 'text-success',
    muted: 'text-white/45',
    accent: 'text-accent',
};

export default function MoneyDisplay({ value, currency, className = '', tone = 'default' }: MoneyDisplayProps) {
    return <span className={`tabular-nums ${TONES[tone]} ${className}`}>{money(value, currency)}</span>;
}
