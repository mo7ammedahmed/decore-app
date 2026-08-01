import type { InvoiceStatus, PaymentStatus, Unit } from '@/types/domain';

const SYMBOLS: Record<string, string> = {
    SAR: 'ر.س',
    USD: '$',
    EUR: '€',
};

/**
 * Format a numeric string as a localized money value.
 */
export function money(value: string | number | null | undefined, currency?: string | null): string {
    const amount = Number(value ?? 0);
    const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return currency ? `${SYMBOLS[currency] ?? currency} ${formatted}` : formatted;
}

/**
 * Format a date string (YYYY-MM-DD or ISO) for display.
 */
export function formatDate(value: string | null | undefined): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const UNIT_LABELS: Record<Unit, string> = {
    piece: 'Piece',
    square_meter: 'm²',
    meter: 'Meter',
    box: 'Box',
    sheet: 'Sheet',
};

const ARABIC_UNIT_LABELS: Record<Unit, string> = {
    piece: 'قطعة',
    square_meter: 'م²',
    meter: 'متر',
    box: 'صندوق',
    sheet: 'لوح',
};

export function unitLabel(unit: Unit, locale: string = 'en'): string {
    const labels = locale === 'ar' ? ARABIC_UNIT_LABELS : UNIT_LABELS;
    return labels[unit] ?? unit;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    issued: 'Issued',
    cancelled: 'Cancelled',
    completed: 'Completed',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    unpaid: 'Unpaid',
    partial: 'Partial',
    paid: 'Paid',
    overpaid: 'Overpaid',
};

const INVOICE_TONES: Record<InvoiceStatus, string> = {
    draft: 'bg-white/[0.06] text-white/60',
    issued: 'bg-info/15 text-info',
    cancelled: 'bg-danger/15 text-danger',
    completed: 'bg-success/15 text-success',
};

const PAYMENT_TONES: Record<PaymentStatus, string> = {
    unpaid: 'bg-danger/15 text-danger',
    partial: 'bg-warning/15 text-warning',
    paid: 'bg-success/15 text-success',
    overpaid: 'bg-info/15 text-info',
};

export function invoiceTone(status: InvoiceStatus): string {
    return INVOICE_TONES[status] ?? 'bg-white/[0.06] text-white/60';
}

export function paymentTone(status: PaymentStatus): string {
    return PAYMENT_TONES[status] ?? 'bg-white/[0.06] text-white/60';
}

/**
 * Simple humanised action label for audit logs.
 */
export function actionLabel(action: string): string {
    return action
        .replaceAll('.', ' ')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
