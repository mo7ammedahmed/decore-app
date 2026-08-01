<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Payment;
use App\Models\Supplier;
use App\Models\User;
use App\Support\Money;
use Carbon\CarbonInterface;

class DashboardService
{
    public function __construct(
        private readonly ProfitService $profit,
        private readonly VisitorAnalyticsService $analytics,
    ) {
    }

    /**
     * Resolve a period key into inclusive [from, to] date strings.
     *
     * @return array{from: string, to: string}
     */
    public function periodBounds(string $period, ?string $customFrom = null, ?string $customTo = null): array
    {
        return match ($period) {
            'today' => ['from' => now()->toDateString(), 'to' => now()->toDateString()],
            'week' => ['from' => now()->startOfWeek()->toDateString(), 'to' => now()->endOfWeek()->toDateString()],
            'year' => ['from' => now()->startOfYear()->toDateString(), 'to' => now()->endOfYear()->toDateString()],
            'custom' => [
                'from' => $customFrom ?? now()->startOfMonth()->toDateString(),
                'to' => $customTo ?? now()->endOfMonth()->toDateString(),
            ],
            default => ['from' => now()->startOfMonth()->toDateString(), 'to' => now()->endOfMonth()->toDateString()],
        };
    }

    /**
     * Role-aware dashboard payload.
     *
     * @return array<string, mixed>
     */
    public function index(User $user, array $bounds): array
    {
        return match ($user->role) {
            \App\Enums\UserRole::Admin => $this->admin($bounds),
            \App\Enums\UserRole::Accountant => $this->accountant($bounds),
            \App\Enums\UserRole::SalesStaff => $this->sales($user),
            \App\Enums\UserRole::Supplier => $this->supplier($user),
        };
    }

    /**
     * @param  array{from: string, to: string}  $bounds
     * @return array<string, mixed>
     */
    public function admin(array $bounds): array
    {
        $finalized = Invoice::query()
            ->finalized()
            ->with('items')
            ->createdBetween($bounds['from'], $bounds['to'])
            ->get();

        $financial = $this->profit->aggregate($finalized);

        $paymentsReceived = Money::round(
            Payment::query()
                ->active()
                ->whereBetween('paid_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
                ->sum('base_amount')
        );

        $outstanding = $this->outstandingTotal();
        $overdue = Invoice::query()->overdue()->count();
        $dueSoon = Invoice::query()
            ->outstanding()
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [now()->toDateString(), now()->addDays(7)->toDateString()])
            ->count();

        return [
            'counts' => [
                'suppliers' => Supplier::query()->active()->count(),
                'materials' => Material::query()->active()->count(),
                'customers' => Customer::query()->count(),
                'invoices' => Invoice::query()->finalized()->count(),
            ],
            'financial' => [
                'revenue' => $financial['revenue'],
                'costs' => $financial['cost'],
                'gross_profit' => $financial['gross_profit'],
                'margin' => $financial['margin'],
                'payments_received' => $paymentsReceived,
                'outstanding_balance' => $outstanding,
                'overdue_count' => $overdue,
                'due_soon_count' => $dueSoon,
            ],
            'recent_invoices' => Invoice::query()
                ->with(['customer:id,name', 'creator:id,name'])
                ->latest('issue_date')
                ->limit(8)
                ->get(),
            'recent_payments' => Payment::query()
                ->active()
                ->with(['invoice:id,invoice_number', 'recorder:id,name'])
                ->latest('paid_at')
                ->limit(8)
                ->get(),
            'low_stock' => Material::query()
                ->lowStock()
                ->with('supplier:id,name')
                ->orderBy('stock_quantity')
                ->limit(10)
                ->get(),
            'top_selling' => $this->topSelling(6, $bounds),
            'revenue_by_month' => $this->revenueByMonth($bounds),
            'revenue_by_classification' => $this->revenueByClassification($bounds),
            'revenue_by_supplier' => $this->revenueBySupplier($bounds),
            // Public-site visitor analytics — admin sees the full audience.
            'analytics' => $this->analytics->forPeriod($bounds),
        ];
    }

    /**
     * @param  array{from: string, to: string}  $bounds
     * @return array<string, mixed>
     */
    public function accountant(array $bounds): array
    {
        $finalized = Invoice::query()
            ->finalized()
            ->with('items')
            ->createdBetween($bounds['from'], $bounds['to'])
            ->get();

        $financial = $this->profit->aggregate($finalized);

        $paymentsReceived = Money::round(
            Payment::query()
                ->active()
                ->whereBetween('paid_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
                ->sum('base_amount')
        );

        return [
            'financial' => [
                'revenue' => $financial['revenue'],
                'costs' => $financial['cost'],
                'gross_profit' => $financial['gross_profit'],
                'margin' => $financial['margin'],
                'payments_received' => $paymentsReceived,
                'outstanding_balance' => $this->outstandingTotal(),
                'overdue_count' => Invoice::query()->overdue()->count(),
                'due_soon_count' => Invoice::query()
                    ->outstanding()
                    ->whereNotNull('due_date')
                    ->whereBetween('due_date', [now()->toDateString(), now()->addDays(7)->toDateString()])
                    ->count(),
            ],
            'recent_payments' => Payment::query()
                ->active()
                ->with(['invoice:id,invoice_number', 'recorder:id,name'])
                ->latest('paid_at')
                ->limit(8)
                ->get(),
            'overdue_invoices' => Invoice::query()
                ->overdue()
                ->with(['customer:id,name'])
                ->orderBy('due_date')
                ->limit(10)
                ->get(),
            'revenue_by_month' => $this->revenueByMonth($bounds),
            'payments_by_month' => $this->paymentsByMonth($bounds),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function sales(User $user): array
    {
        $mine = Invoice::query()->where('created_by', $user->id);

        $personalTotal = Money::round(
            (clone $mine)->finalized()->sum('base_total')
        );

        $popular = \DB::table('invoice_items as ii')
            ->join('invoices as i', 'i.id', '=', 'ii.invoice_id')
            ->where('i.created_by', $user->id)
            ->whereIn('i.status', [InvoiceStatus::Issued->value, InvoiceStatus::Completed->value])
            ->groupBy('ii.material_id', 'ii.description')
            ->selectRaw('ii.material_id, ii.description, SUM(ii.quantity) as total_qty')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        $followUps = Invoice::query()
            ->outstanding()
            ->where('created_by', $user->id)
            ->with('customer:id,name,phone')
            ->orderBy('due_date')
            ->limit(10)
            ->get();

        return [
            'counts' => [
                'draft_invoices' => (clone $mine)->where('status', InvoiceStatus::Draft->value)->count(),
                'issued_invoices' => (clone $mine)->where('status', InvoiceStatus::Issued->value)->count(),
                'customers' => Customer::query()->count(),
            ],
            'financial' => [
                'personal_sales_total' => $personalTotal,
                'outstanding_follow_ups' => $followUps->count(),
            ],
            'recent_customers' => Customer::query()->latest()->limit(6)->get(),
            'popular_materials' => $popular,
            'recent_invoices' => (clone $mine)->with('customer:id,name')->latest('issue_date')->limit(6)->get(),
            'follow_ups' => $followUps,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function supplier(User $user): array
    {
        $supplierId = (int) $user->supplier_id;

        $materials = Material::query()->forSupplier($supplierId);

        $missingImages = (clone $materials)
            ->active()
            ->whereNull('image_path')
            ->count();

        return [
            'counts' => [
                'materials' => (clone $materials)->count(),
                'active_materials' => (clone $materials)->active()->count(),
                'missing_images' => $missingImages,
            ],
            'recent_materials' => (clone $materials)->with('classification:id,name_en,name_ar')->latest('updated_at')->limit(6)->get(),
            'low_stock' => (clone $materials)->lowStock()->orderBy('stock_quantity')->limit(8)->get(),
        ];
    }

    /**
     * Outstanding balance across finalized invoices, in base currency.
     */
    protected function outstandingTotal(): string
    {
        $invoices = Invoice::query()
            ->outstanding()
            ->with([
                'items',
                'payments' => fn ($q) => $q->whereNull('reversed_at')->select('invoice_id', 'base_amount'),
            ])
            ->get();

        $outstanding = '0.00';

        foreach ($invoices as $invoice) {
            $paid = '0.00';
            foreach ($invoice->payments as $payment) {
                $paid = Money::add($paid, $payment->base_amount);
            }

            $outstanding = Money::add($outstanding, Money::sub($invoice->base_total, $paid));
        }

        return $outstanding;
    }

    /**
     * Top selling materials by quantity across finalized invoices.
     *
     * @return \Illuminate\Support\Collection<int, object>
     */
    protected function topSelling(int $limit, array $bounds)
    {
        $locale = app()->getLocale();

        return \DB::table('invoice_items as ii')
            ->join('invoices as i', 'i.id', '=', 'ii.invoice_id')
            ->join('materials as m', 'm.id', '=', 'ii.material_id')
            ->whereIn('i.status', [InvoiceStatus::Issued->value, InvoiceStatus::Completed->value])
            ->whereBetween('i.issue_date', [$bounds['from'], $bounds['to']])
            ->groupBy('ii.material_id', 'm.name_en', 'm.name_ar')
            ->selectRaw('ii.material_id, m.name_en, m.name_ar, SUM(ii.quantity) as total_qty, SUM(ii.line_subtotal * i.exchange_rate) as revenue')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get()
            ->map(function ($row) use ($locale) {
                $row->name = $locale === 'ar' && $row->name_ar ? $row->name_ar : $row->name_en;
                unset($row->name_ar);

                return $row;
            });
    }

    /**
     * Portable month-grouping expression (MySQL and SQLite).
     */
    protected function monthExpression(string $column): string
    {
        return \DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }

    /**
     * Revenue is gross of line discounts (matches base_subtotal and the other
     * by-* series); the headline financial.revenue from ProfitService nets
     * line discounts. The two definitions are intentionally different.
     *
     * @return array<int, array{month: string, revenue: string}>
     */
    protected function revenueByMonth(array $bounds): array
    {
        $rows = \DB::table('invoices')
            ->whereIn('status', [InvoiceStatus::Issued->value, InvoiceStatus::Completed->value])
            ->whereBetween('issue_date', [$bounds['from'], $bounds['to']])
            ->selectRaw($this->monthExpression('issue_date').' as month, SUM(base_subtotal) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $rows->map(fn ($row) => [
            'month' => $row->month,
            'revenue' => Money::round($row->revenue),
        ])->all();
    }

    /**
     * @return array<int, array{name: string, revenue: string}>
     */
    protected function revenueByClassification(array $bounds): array
    {
        $locale = app()->getLocale();

        $rows = \DB::table('invoice_items as ii')
            ->join('invoices as i', 'i.id', '=', 'ii.invoice_id')
            ->join('classifications as c', 'c.id', '=', 'ii.classification_id')
            ->whereIn('i.status', [InvoiceStatus::Issued->value, InvoiceStatus::Completed->value])
            ->whereBetween('i.issue_date', [$bounds['from'], $bounds['to']])
            ->groupBy('ii.classification_id', 'c.name_en', 'c.name_ar')
            ->selectRaw('c.name_en, c.name_ar, SUM(ii.line_subtotal * i.exchange_rate) as revenue')
            ->orderByDesc('revenue')
            ->get();

        return $rows->map(fn ($row) => [
            'name' => $locale === 'ar' && $row->name_ar ? $row->name_ar : $row->name_en,
            'revenue' => Money::round($row->revenue),
        ])->all();
    }

    /**
     * @return array<int, array{name: string, revenue: string}>
     */
    protected function revenueBySupplier(array $bounds): array
    {
        $rows = \DB::table('invoice_items as ii')
            ->join('invoices as i', 'i.id', '=', 'ii.invoice_id')
            ->join('suppliers as s', 's.id', '=', 'ii.supplier_id')
            ->whereIn('i.status', [InvoiceStatus::Issued->value, InvoiceStatus::Completed->value])
            ->whereBetween('i.issue_date', [$bounds['from'], $bounds['to']])
            ->groupBy('ii.supplier_id', 's.name')
            ->selectRaw('s.name, SUM(ii.line_subtotal * i.exchange_rate) as revenue')
            ->orderByDesc('revenue')
            ->get();

        return $rows->map(fn ($row) => [
            'name' => $row->name,
            'revenue' => Money::round($row->revenue),
        ])->all();
    }

    /**
     * @return array<int, array{month: string, payments: string}>
     */
    protected function paymentsByMonth(array $bounds): array
    {
        $rows = \DB::table('payments')
            ->whereNull('reversed_at')
            ->whereBetween('paid_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
            ->selectRaw($this->monthExpression('paid_at').' as month, SUM(base_amount) as payments')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $rows->map(fn ($row) => [
            'month' => $row->month,
            'payments' => Money::round($row->payments),
        ])->all();
    }
}
