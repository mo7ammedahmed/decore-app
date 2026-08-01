<?php

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\DashboardService;
use App\Services\ProfitService;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboard,
        private readonly ProfitService $profit,
    ) {}

    /**
     * Role-aware financial reports. Suppliers and sales staff have no access.
     */
    public function index(Request $request): Response
    {
        if (! in_array($request->user()->role->value, ['admin', 'accountant'], true)) {
            abort(403, 'You do not have permission to view reports.');
        }

        $report = $request->query('report', 'revenue');
        $bounds = $this->dashboard->periodBounds(
            $request->query('period', 'month'),
            $request->query('from'),
            $request->query('to'),
        );

        $finalized = Invoice::query()
            ->finalized()
            ->with(['items', 'customer:id,name'])
            ->createdBetween($bounds['from'], $bounds['to'])
            ->get();

        $data = match ($report) {
            'outstanding' => $this->outstandingReport(),
            'payments' => $this->paymentsReport($bounds),
            'costs' => $this->costsReport($finalized),
            'profit' => $this->profitReport($finalized),
            'sales_by_staff' => $this->salesByStaff($bounds),
            'materials' => $this->materialsReport($bounds),
            default => $this->revenueReport($finalized),
        };

        return Inertia::render('Reports/Index', [
            'report' => $report,
            'period' => $request->query('period', 'month'),
            'periodBounds' => $bounds,
            ...$data,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function revenueReport($invoices): array
    {
        $summary = $this->profit->aggregate($invoices);

        return [
            'title' => 'Revenue Report',
            'summary' => [
                'revenue' => $summary['revenue'],
                'costs' => $summary['cost'],
                'gross_profit' => $summary['gross_profit'],
                'margin' => $summary['margin'],
                'invoice_count' => $invoices->count(),
            ],
            'rows' => $invoices->map(fn (Invoice $invoice) => [
                'invoice_number' => $invoice->invoice_number,
                'customer' => $invoice->customer?->name,
                'issue_date' => $invoice->issue_date->toDateString(),
                'total' => $invoice->total,
                'currency' => $invoice->currency_code,
                'status' => $invoice->status->value,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function outstandingReport(): array
    {
        $invoices = Invoice::query()
            ->outstanding()
            ->with('customer:id,name')
            ->orderBy('due_date')
            ->get();

        $total = '0.00';

        $rows = $invoices->map(function (Invoice $invoice) use (&$total) {
            $paid = Money::round($invoice->activePayments()->sum('base_amount'));
            $balance = Money::sub($invoice->base_total, $paid);
            $total = Money::add($total, $balance);

            return [
                'invoice_number' => $invoice->invoice_number,
                'customer' => $invoice->customer?->name,
                'issue_date' => $invoice->issue_date->toDateString(),
                'due_date' => $invoice->due_date?->toDateString(),
                'total' => $invoice->total,
                'balance' => $balance,
                'currency' => $invoice->currency_code,
                'overdue' => $invoice->due_date !== null && $invoice->due_date->lt(now()->startOfDay()),
            ];
        })->values()->all();

        return [
            'title' => 'Outstanding Balances',
            'summary' => ['outstanding_total' => $total, 'invoice_count' => $invoices->count()],
            'rows' => $rows,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function paymentsReport(array $bounds): array
    {
        $payments = Payment::query()
            ->active()
            ->with(['invoice:id,invoice_number', 'recorder:id,name'])
            ->whereBetween('paid_at', [$bounds['from'].' 00:00:00', $bounds['to'].' 23:59:59'])
            ->orderByDesc('paid_at')
            ->get();

        return [
            'title' => 'Payments Received',
            'summary' => ['payments_total' => Money::round($payments->sum('base_amount')), 'payment_count' => $payments->count()],
            'rows' => $payments->map(fn (Payment $payment) => [
                'payment_number' => $payment->payment_number,
                'invoice' => $payment->invoice?->invoice_number,
                'amount' => $payment->amount,
                'base_amount' => $payment->base_amount,
                'method' => $payment->payment_method->value,
                'paid_at' => $payment->paid_at?->toDateTimeString(),
                'recorder' => $payment->recorder?->name,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function costsReport($invoices): array
    {
        $totalCost = '0.00';
        $rows = [];

        foreach ($invoices as $invoice) {
            foreach ($invoice->items as $item) {
                $lineCost = Money::mul($item->base_unit_cost, $item->quantity);
                $totalCost = Money::add($totalCost, $lineCost);

                $rows[] = [
                    'invoice' => $invoice->invoice_number,
                    'material' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_cost' => $item->unit_cost,
                    'base_cost' => $lineCost,
                ];
            }
        }

        return [
            'title' => 'Supplier Costs',
            'summary' => ['total_cost' => $totalCost, 'item_count' => count($rows)],
            'rows' => $rows,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function profitReport($invoices): array
    {
        $summary = $this->profit->aggregate($invoices);

        $rows = [];

        foreach ($invoices as $invoice) {
            foreach ($invoice->items as $item) {
                $itemProfit = $this->profit->forItem($item);
                $rows[] = [
                    'invoice' => $invoice->invoice_number,
                    'material' => $item->description,
                    'revenue' => $itemProfit['revenue'],
                    'cost' => $itemProfit['cost'],
                    'gross_profit' => $itemProfit['gross_profit'],
                    'margin' => $itemProfit['margin'],
                ];
            }
        }

        return [
            'title' => 'Profit & Margin',
            'summary' => $summary,
            'rows' => $rows,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function salesByStaff(array $bounds): array
    {
        $rows = \DB::table('invoices')
            ->join('users', 'users.id', '=', 'invoices.created_by')
            ->whereIn('invoices.status', [InvoiceStatus::Issued->value, InvoiceStatus::Completed->value])
            ->whereBetween('invoices.issue_date', [$bounds['from'], $bounds['to']])
            ->groupBy('users.id', 'users.name')
            ->selectRaw('users.id, users.name, COUNT(*) as invoice_count, SUM(invoices.base_total) as sales_total')
            ->orderByDesc('sales_total')
            ->get();

        return [
            'title' => 'Sales by Staff',
            'summary' => ['staff_count' => $rows->count()],
            'rows' => $rows->map(fn ($row) => [
                'staff' => $row->name,
                'invoice_count' => $row->invoice_count,
                'sales_total' => Money::round($row->sales_total),
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function materialsReport(array $bounds): array
    {
        $rows = \DB::table('invoice_items as ii')
            ->join('invoices as i', 'i.id', '=', 'ii.invoice_id')
            ->join('classifications as c', 'c.id', '=', 'ii.classification_id')
            ->whereIn('i.status', [InvoiceStatus::Issued->value, InvoiceStatus::Completed->value])
            ->whereBetween('i.issue_date', [$bounds['from'], $bounds['to']])
            ->groupBy('ii.material_id', 'ii.description', 'c.name_en')
            ->selectRaw('ii.description, c.name_en as classification, SUM(ii.quantity) as total_qty, SUM(ii.line_subtotal * i.exchange_rate) as revenue')
            ->orderByDesc('revenue')
            ->get();

        return [
            'title' => 'Materials by Classification',
            'summary' => ['material_count' => $rows->count()],
            'rows' => $rows->map(fn ($row) => [
                'material' => $row->description,
                'classification' => $row->classification,
                'total_qty' => $row->total_qty,
                'revenue' => Money::round($row->revenue),
            ])->values()->all(),
        ];
    }
}
