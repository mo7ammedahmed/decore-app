import type { Invoice } from '@/types/domain';
import { money } from '@/Utilities/format';

export default function PaymentProgress({ invoice, currency }: { invoice: Invoice; currency?: string | null }) {
    const total = Number(invoice.total) || 0;
    const paid = Number(invoice.paid_total) || 0;
    const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

    return (
        <div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-white/45">Paid {percent}%</span>
                <span className="tabular-nums text-white/70">
                    {money(paid, currency)} of {money(total, currency)}
                </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent transition-all duration-700"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <p className="mt-2 text-xs text-white/45">
                Balance due:{' '}
                <span className={`tabular-nums ${Number(invoice.balance_due) > 0 ? 'text-white/80' : 'text-success'}`}>
                    {money(invoice.balance_due, currency)}
                </span>
            </p>
        </div>
    );
}
