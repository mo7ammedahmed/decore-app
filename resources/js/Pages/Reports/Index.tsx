import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import MoneyDisplay from '@/Components/MoneyDisplay';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { formatDate, formatDateTime, invoiceTone } from '@/Utilities/format';

interface ReportProps {
    report: string;
    period: string;
    periodBounds: { from: string; to: string };
    title: string;
    summary: Record<string, string | number>;
    rows: Record<string, unknown>[];
    [key: string]: unknown;
}

const REPORTS: { value: string; label: string }[] = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'outstanding', label: 'Outstanding' },
    { value: 'payments', label: 'Payments' },
    { value: 'costs', label: 'Costs' },
    { value: 'profit', label: 'Profit' },
    { value: 'sales_by_staff', label: 'Sales by staff' },
    { value: 'materials', label: 'Materials' },
];

const PERIODS: { value: string; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
];

export default function ReportsIndex({ report, period, periodBounds, title, summary, rows }: ReportProps) {
    const switchReport = (value: string) => {
        router.get(route('reports.index'), { report: value, period }, { preserveState: true, replace: true });
    };

    const switchPeriod = (value: string) => {
        router.get(route('reports.index'), { report, period: value }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reports" />

            <PageHeader title={title} description={`${formatDate(periodBounds.from)} → ${formatDate(periodBounds.to)}`}>
                <div className="flex flex-wrap items-center gap-2">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => switchPeriod(p.value)}
                            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors duration-150 ${
                                period === p.value
                                    ? 'liquid-glass-strong text-white'
                                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </PageHeader>

            <div className="mb-6 flex flex-wrap gap-2">
                {REPORTS.map((r) => (
                    <button
                        key={r.value}
                        onClick={() => switchReport(r.value)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                            report === r.value
                                ? 'liquid-glass-strong text-white'
                                : 'liquid-glass text-white/55 hover:text-white'
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            <GlassCard className="p-6">
                <div className="mb-6 flex flex-wrap gap-3">
                    {Object.entries(summary).map(([key, value]) => (
                        <div key={key} className="liquid-glass flex-1 rounded-2xl px-5 py-4 text-center min-w-36">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                                {key.replaceAll('_', ' ')}
                            </p>
                            <p className="mt-1.5 font-heading text-xl italic tabular-nums text-accent">
                                {formatSummaryValue(key, value)}
                            </p>
                        </div>
                    ))}
                </div>

                {rows.length === 0 ? (
                    <EmptyState title="No data in this period" description="Try a different period or report type." />
                ) : (
                    <ReportTable report={report} rows={rows} />
                )}
            </GlassCard>
        </AuthenticatedLayout>
    );
}

function formatSummaryValue(key: string, value: string | number): ReactNode {
    if (typeof value === 'number') return value.toLocaleString();
    if (key === 'margin') return `${moneyString(value)}%`;
    if (key.includes('total') || key.includes('profit') || key.includes('revenue') || key.includes('sales')) {
        return moneyString(value);
    }
    return value;
}

function moneyString(value: string): string {
    const n = Number(value) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ReportTable({ report, rows }: { report: string; rows: Record<string, unknown>[] }) {
    if (rows.length === 0) return null;

    const headers = Object.keys(rows[0]);

    return (
        <div className="overflow-x-auto">
            <table className="table-glass w-full min-w-[720px]">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className={isNumericHeader(header) ? 'text-right' : 'text-left'}>
                                {header.replaceAll('_', ' ')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {headers.map((header) => (
                                <td
                                    key={header}
                                    className={isNumericHeader(header) ? 'text-right tabular-nums' : ''}
                                >
                                    {renderCell(header, row[header])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function isNumericHeader(header: string): boolean {
    return ['total', 'qty', 'count', 'revenue', 'cost', 'amount', 'balance', 'rate', 'margin', 'profit', 'price'].some(
        (token) => header.includes(token),
    );
}

function renderCell(header: string, value: unknown): ReactNode {
    if (value === null || value === undefined || value === '') return <span className="text-white/30">—</span>;

    if (header === 'status') {
        return <StatusBadge label={String(value)} tone={invoiceTone(value as never)} dot={false} />;
    }

    if (header === 'issue_date' || header === 'effective_date') {
        return formatDate(String(value));
    }

    if (header === 'paid_at') {
        return formatDateTime(String(value));
    }

    if (isNumericHeader(header) && !['invoice_count', 'payment_count', 'item_count', 'staff_count', 'material_count'].includes(header)) {
        return <MoneyDisplay value={String(value)} />;
    }

    return String(value);
}
