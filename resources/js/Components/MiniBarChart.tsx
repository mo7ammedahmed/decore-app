/**
 * Accessible mini bar chart for dashboard trend summaries.
 *
 * Per the ui-ux-pro-max chart guidance:
 *  - Values are always visible as text (never hover-only).
 *  - role="img" + aria-label names the chart, and a visually-hidden data list
 *    exposes the full series to screen readers.
 *  - Bars use deterministic pixel heights (a % height against an auto-height
 *    flex column would collapse to 0), so the chart renders reliably.
 *  - A Total / Peak caption gives an at-a-glance summary without hover.
 */

interface MiniBarChartDatum {
    label: string;
    value: number;
}

interface MiniBarChartProps {
    data: MiniBarChartDatum[];
    /** Full formatter, e.g. money(v, 'SAR') — used for tooltips and the summary. */
    format: (value: number) => string;
    title: string;
    tone?: 'accent' | 'success';
}

const TONES = {
    accent: 'from-accent/25 to-accent/80 group-hover:from-accent/40 group-hover:to-accent',
    success: 'from-success/25 to-success/80 group-hover:from-success/40 group-hover:to-success',
} as const;

/** Compact label so bars stay legible even with 12 months. */
function compact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const MAX_BAR_PX = 130;

export default function MiniBarChart({ data, format, title, tone = 'accent' }: MiniBarChartProps) {
    const max = Math.max(...data.map((d) => d.value), 1);
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0] ?? { label: '', value: 0 });

    const summary = data.map((d) => `${d.label}: ${format(d.value)}`).join(', ');

    return (
        <figure>
            {/* The sr-only <p> below carries the full series — aria-label stays a
                short name so screen readers do not hear the data twice. */}
            <div role="img" aria-label={title} className="mt-6 flex h-44 items-end gap-3">
                {data.map((d) => (
                    <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-[10px] font-medium tabular-nums text-white/55 transition-colors group-hover:text-white/80">
                            {compact(d.value)}
                        </span>
                        <div
                            className={`w-full rounded-t-lg bg-gradient-to-t transition-[height,background-color] duration-500 ${TONES[tone]}`}
                            style={{ height: `${Math.max(6, Math.round((d.value / max) * MAX_BAR_PX))}px` }}
                            title={`${d.label}: ${format(d.value)}`}
                        />
                        <span className="text-[10px] uppercase tracking-wide text-white/35">{d.label.slice(5)}</span>
                    </div>
                ))}
            </div>

            <figcaption className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/45">
                <span>
                    Total <span className="font-medium tabular-nums text-white/80">{format(total)}</span>
                </span>
                {peak.label !== '' && (
                    <span>
                        Peak{' '}
                        <span className="font-medium tabular-nums text-white/80">
                            {peak.label.slice(5)} · {format(peak.value)}
                        </span>
                    </span>
                )}
            </figcaption>

            <p className="sr-only">{summary}</p>
        </figure>
    );
}
