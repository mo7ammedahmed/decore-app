<?php

namespace Tests\Feature;

use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Supplier;
use App\Models\User;
use App\Services\DashboardService;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    private DashboardService $dashboard;

    private InvoiceService $invoices;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
        $this->dashboard = app(DashboardService::class);
        $this->invoices = app(InvoiceService::class);
    }

    private function bounds(): array
    {
        return [
            'from' => '2026-06-01',
            'to' => '2026-06-30',
        ];
    }

    private function createInvoice(User $user, float $price, string $status = 'issued', float $tax = 15): Invoice
    {
        $material = Material::factory()->create([
            'selling_price' => $price,
            'default_supplier_cost' => $price * 0.4,
            'currency_code' => 'SAR',
        ]);
        $customer = Customer::factory()->create(['created_by' => $user->id]);

        $invoice = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => $tax,
        ]], $user);

        if ($status === 'issued') {
            $this->invoices->issue($invoice, $user);
        } elseif ($status === 'cancelled') {
            $this->invoices->issue($invoice, $user);
            $this->invoices->cancel($invoice, $user);
        }

        return $invoice->fresh();
    }

    public function test_revenue_excludes_cancelled_and_draft_invoices(): void
    {
        $user = User::factory()->admin()->create();

        $issued = $this->createInvoice($user, 100.00, 'issued');
        $this->createInvoice($user, 500.00, 'cancelled');
        $this->createInvoice($user, 300.00, 'draft');

        $metrics = $this->dashboard->admin($this->bounds());

        $this->assertSame('100.00', $metrics['financial']['revenue']);
        $this->assertSame(1, $metrics['counts']['invoices']);
        $this->assertSame(InvoiceStatus::Issued, $issued->status);
    }

    public function test_profit_is_computed_from_stored_cost_snapshots(): void
    {
        $user = User::factory()->admin()->create();
        $this->createInvoice($user, 100.00, 'issued');

        $metrics = $this->dashboard->admin($this->bounds());

        // Price 100.00, cost snapshot 40.00 (40% of price), qty 1.
        $this->assertSame('60.00', $metrics['financial']['gross_profit']);
        $this->assertSame('40.00', $metrics['financial']['costs']);
        $this->assertSame('60.00', $metrics['financial']['margin']);
    }

    public function test_revenue_by_classification_matches_monthly_basis(): void
    {
        $user = User::factory()->admin()->create();
        $this->createInvoice($user, 100.00, 'issued');

        $metrics = $this->dashboard->admin($this->bounds());

        $byMonth = collect($metrics['revenue_by_month'])->first();
        $byClassification = collect($metrics['revenue_by_classification'])->first();

        // Both must be tax-exclusive (100.00), never the tax-inclusive 115.00.
        $this->assertSame('100.00', $byMonth['revenue']);
        $this->assertSame('100.00', $byClassification['revenue']);
    }

    public function test_revenue_by_supplier_and_classification_are_tax_exclusive(): void
    {
        $user = User::factory()->admin()->create();
        $this->createInvoice($user, 100.00, 'issued');

        $metrics = $this->dashboard->admin($this->bounds());

        $this->assertSame('100.00', collect($metrics['revenue_by_supplier'])->first()['revenue']);
        $this->assertSame('100.00', collect($metrics['revenue_by_classification'])->first()['revenue']);
    }

    public function test_supplier_dashboard_is_scoped_to_own_supplier(): void
    {
        $supplierA = Supplier::factory()->create();
        $supplierB = Supplier::factory()->create();

        Material::factory()->count(2)->create(['supplier_id' => $supplierA->id]);
        Material::factory()->count(3)->create(['supplier_id' => $supplierB->id]);

        $user = User::factory()->supplier($supplierA)->create();

        $metrics = $this->dashboard->supplier($user);

        $this->assertSame(2, $metrics['counts']['materials']);
        $this->assertSame(2, $metrics['counts']['active_materials']);
        $this->assertArrayNotHasKey('financial', $metrics);
    }

    public function test_sales_dashboard_shows_personal_totals_only(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $other = User::factory()->salesStaff()->create();

        $this->createInvoice($sales, 100.00, 'issued');
        $this->createInvoice($other, 900.00, 'issued');

        $metrics = $this->dashboard->sales($sales);

        // personal_sales_total sums base_total, which is tax-inclusive
        // (100.00 + 15% VAT = 115.00).
        $this->assertSame('115.00', $metrics['financial']['personal_sales_total']);
        $this->assertSame(1, $metrics['counts']['issued_invoices']);
    }

    public function test_period_bounds_resolution(): void
    {
        $this->assertSame(
            now()->toDateString(),
            $this->dashboard->periodBounds('today')['from'],
        );
        $this->assertSame(
            now()->startOfMonth()->toDateString(),
            $this->dashboard->periodBounds('month')['from'],
        );
        $custom = $this->dashboard->periodBounds('custom', '2026-01-01', '2026-01-31');
        $this->assertSame('2026-01-01', $custom['from']);
        $this->assertSame('2026-01-31', $custom['to']);
    }

    public function test_low_stock_scope(): void
    {
        Material::factory()->create([
            'stock_quantity' => 5,
            'minimum_stock_level' => 10,
            'is_active' => true,
        ]);
        Material::factory()->create([
            'stock_quantity' => 50,
            'minimum_stock_level' => 10,
            'is_active' => true,
        ]);

        $lowStock = Material::query()->lowStock()->get();

        $this->assertCount(1, $lowStock);
    }
}
