<?php

namespace App\Services;

use App\Models\PageView;
use App\Models\VisitorSession;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Aggregates the public-site visitor analytics for dashboard display.
 *
 * Sessions are counted by their start date, page views by their entry date.
 * Long ranges (more than ~31 days) are rolled up by month so the chart stays
 * legible; shorter ranges return one point per day.
 */
class VisitorAnalyticsService
{
    private const MAX_DAILY_POINTS = 31;

    /**
     * @param  array{from: string, to: string}  $bounds
     * @return array<string, mixed>
     */
    public function forPeriod(array $bounds): array
    {
        return [
            'summary' => $this->summary($bounds),
            'series' => $this->series($bounds),
        ];
    }

    /**
     * @param  array{from: string, to: string}  $bounds
     * @return array{visitors: int, sessions: int, page_views: int}
     */
    public function summary(array $bounds): array
    {
        $sessions = VisitorSession::query()
            ->whereBetween('started_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59']);

        $pageViews = PageView::query()
            ->whereBetween('entered_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59']);

        return [
            'visitors' => (clone $sessions)->distinct('visitor_hash')->count('visitor_hash'),
            'sessions' => (clone $sessions)->count(),
            'page_views' => (clone $pageViews)->count(),
        ];
    }

    /**
     * One point per day (or per month for long ranges).
     *
     * @param  array{from: string, to: string}  $bounds
     * @return array<int, array{date: string, label: string, visitors: int, sessions: int, page_views: int}>
     */
    public function series(array $bounds): array
    {
        $start = Carbon::parse($bounds['from'])->startOfDay();
        $end = Carbon::parse($bounds['to'])->startOfDay();
        $days = (int) $start->diffInDays($end) + 1;

        if ($days > self::MAX_DAILY_POINTS) {
            return $this->monthlySeries($bounds, $start, $days);
        }

        return $this->dailySeries($bounds, $start, $days);
    }

    /**
     * @param  array{from: string, to: string}  $bounds
     * @return array<int, array{date: string, label: string, visitors: int, sessions: int, page_views: int}>
     */
    private function dailySeries(array $bounds, CarbonInterface $start, int $days): array
    {
        $sessionRows = VisitorSession::query()
            ->whereBetween('started_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
            ->selectRaw('DATE(started_at) as date_key, COUNT(*) as sessions, COUNT(DISTINCT visitor_hash) as visitors')
            ->groupBy('date_key')
            ->get()
            ->keyBy('date_key');
        $pageViewRows = PageView::query()
            ->whereBetween('entered_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
            ->selectRaw('DATE(entered_at) as date_key, COUNT(*) as page_views')
            ->groupBy('date_key')
            ->get()
            ->keyBy('date_key');

        return collect(range(0, $days - 1))
            ->map(function (int $offset) use ($start, $sessionRows, $pageViewRows): array {
                $date = $start->copy()->addDays($offset);
                $key = $date->toDateString();
                $sessionRow = $sessionRows->get($key);
                $pageViewRow = $pageViewRows->get($key);

                return [
                    'date' => $key,
                    'label' => $date->format('M j'),
                    'visitors' => (int) ($sessionRow?->visitors ?? 0),
                    'sessions' => (int) ($sessionRow?->sessions ?? 0),
                    'page_views' => (int) ($pageViewRow?->page_views ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  array{from: string, to: string}  $bounds
     * @return array<int, array{date: string, label: string, visitors: int, sessions: int, page_views: int}>
     */
    private function monthlySeries(array $bounds, CarbonInterface $start, int $days): array
    {
        $driver = DB::connection()->getDriverName();
        // Each table has its own timestamp column — page_views uses entered_at.
        $monthExpr = fn (string $column): string => $driver === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";

        $sessionRows = VisitorSession::query()
            ->whereBetween('started_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
            ->selectRaw($monthExpr('started_at').' as month_key, COUNT(*) as sessions, COUNT(DISTINCT visitor_hash) as visitors')
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');
        $pageViewRows = PageView::query()
            ->whereBetween('entered_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
            ->selectRaw($monthExpr('entered_at').' as month_key, COUNT(*) as page_views')
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        $months = collect(range(0, $days - 1))
            ->map(fn (int $offset): string => $start->copy()->addDays($offset)->format('Y-m'))
            ->unique()
            ->values();

        return $months
            ->map(function (string $monthKey) use ($sessionRows, $pageViewRows): array {
                $label = Carbon::parse($monthKey.'-01')->format('M Y');
                $sessionRow = $sessionRows->get($monthKey);
                $pageViewRow = $pageViewRows->get($monthKey);

                return [
                    'date' => $monthKey,
                    'label' => $label,
                    'visitors' => (int) ($sessionRow?->visitors ?? 0),
                    'sessions' => (int) ($sessionRow?->sessions ?? 0),
                    'page_views' => (int) ($pageViewRow?->page_views ?? 0),
                ];
            })
            ->values()
            ->all();
    }
}
