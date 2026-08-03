/**
 * Accessible bar chart for the visitor-analytics dashboard card.
 *
 * Follows the same accessibility rules as MiniBarChart:
 *  - Values are always visible as text (never hover-only).
 *  - role="img" + aria-label names the chart; a visually-hidden data list
 *    exposes the full series to screen readers.
 *  - Deterministic pixel heights so the chart renders reliably.
 */

interface TrafficDatum {
    label: string;
    page_views: number;
}

interface TrafficChartProps {
    data: TrafficDatum[];
    title: string;
}

const MAX_BAR_PX = 120;

function compact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function TrafficChart({ data, title }: TrafficChartProps) {
    const max = Math.max(...data.map((d) => d.page_views), 1);
    const total = data.reduce((sum, d) => sum + d.page_views, 0);
    const summary = data.map((d) => `${d.label}: ${d.page_views}`).join(', ');

    return (
        <figure>
            <div role="img" aria-label={title} className="mt-6 flex h-44 items-end gap-2">
                {data.map((d) => (
                    <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-[10px] font-medium tabular-nums text-white/55 transition-colors group-hover:text-white/80">
                            {compact(d.page_views)}
                        </span>
                        <div
                            className={`w-full rounded-t-lg bg-gradient-to-t from-accent/25 to-accent/80 transition-colors duration-500 group-hover:from-accent/40 group-hover:to-accent ${
                                d.page_views === 0 ? 'opacity-30' : ''
                            }`}
                            style={{ height: `${Math.max(4, Math.round((d.page_views / max) * MAX_BAR_PX))}px` }}
                            title={`${d.label}: ${d.page_views}`}
                        />
                        <span className="max-w-full truncate text-[10px] uppercase tracking-wide text-white/35">
                            {d.label}
                        </span>
                    </div>
                ))}
            </div>

            <figcaption className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/45">
                <span>
                    Total <span className="font-medium tabular-nums text-white/80">{compact(total)}</span>
                </span>
            </figcaption>

            <p className="sr-only">{summary}</p>
        </figure>
    );
}
