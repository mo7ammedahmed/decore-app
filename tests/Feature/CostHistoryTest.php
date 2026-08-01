<?php

namespace Tests\Feature;

use App\Enums\DiscountType;
use App\Models\Customer;
use App\Models\Material;
use App\Models\SupplierCostRecord;
use App\Models\User;
use App\Services\CostHistoryService;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CostHistoryTest extends TestCase
{
    use RefreshDatabase;

    private CostHistoryService $costHistory;

    private InvoiceService $invoices;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
        $this->costHistory = app(CostHistoryService::class);
        $this->invoices = app(InvoiceService::class);
    }

    public function test_record_change_closes_the_previous_open_period(): void
    {
        $material = Material::factory()->create([
            'default_supplier_cost' => '40.00',
            'currency_code' => 'SAR',
        ]);

        $this->costHistory->recordChange($material, '40.00', 'SAR', '2026-01-01');
        $this->costHistory->recordChange($material, '60.00', 'SAR', '2026-03-01');

        $open = SupplierCostRecord::query()
            ->where('material_id', $material->id)
            ->whereNull('effective_until')
            ->get();

        $this->assertCount(1, $open);
        $this->assertSame('60.00', $open->first()->cost);

        $closed = SupplierCostRecord::query()
            ->where('material_id', $material->id)
            ->whereNotNull('effective_until')
            ->firstOrFail();

        $this->assertSame('40.00', $closed->cost);
        $this->assertSame('2026-02-28', $closed->effective_until->toDateString());
    }

    public function test_cost_at_returns_the_effective_historical_cost(): void
    {
        $material = Material::factory()->create([
            'default_supplier_cost' => '40.00',
            'currency_code' => 'SAR',
        ]);

        $this->costHistory->recordChange($material, '40.00', 'SAR', '2026-01-01');
        $this->costHistory->recordChange($material, '60.00', 'SAR', '2026-03-01');

        $this->assertSame('40.00', $this->costHistory->costAt($material, '2026-02-15'));
        $this->assertSame('60.00', $this->costHistory->costAt($material, '2026-04-01'));
    }

    public function test_cost_at_returns_null_when_no_record_covers_the_date(): void
    {
        $material = Material::factory()->create([
            'default_supplier_cost' => '40.00',
            'currency_code' => 'SAR',
        ]);

        $this->assertNull($this->costHistory->costAt($material, '2026-06-15'));
    }

    public function test_invoice_items_snapshot_the_historical_cost(): void
    {
        $material = Material::factory()->create([
            'default_supplier_cost' => '40.00',
            'selling_price' => '100.00',
            'currency_code' => 'SAR',
        ]);

        $this->costHistory->recordChange($material, '55.00', 'SAR', '2026-05-01');

        $user = User::factory()->admin()->create();
        $customer = Customer::factory()->create(['created_by' => $user->id]);

        $invoice = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 2,
            'tax_rate' => 0,
        ]], $user);

        // The snapshot must be the effective historical cost (55.00), not the
        // material's current default (40.00).
        $this->assertSame('55.00', $invoice->items->first()->unit_cost);
    }

    public function test_later_cost_changes_do_not_rewrite_older_invoices(): void
    {
        $material = Material::factory()->create([
            'default_supplier_cost' => '40.00',
            'selling_price' => '100.00',
            'currency_code' => 'SAR',
        ]);

        $user = User::factory()->admin()->create();
        $customer = Customer::factory()->create(['created_by' => $user->id]);

        // First invoice on 2026-02-15 — cost is 40.00.
        $this->costHistory->recordChange($material, '40.00', 'SAR', '2026-01-01');

        $oldInvoice = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-02-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]], $user);

        // Cost changes in March; second invoice in April sees the new cost.
        $this->costHistory->recordChange($material, '80.00', 'SAR', '2026-03-01');

        $newInvoice = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-04-01',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]], $user);

        $this->assertSame('40.00', $oldInvoice->items->first()->unit_cost);
        $this->assertSame('80.00', $newInvoice->items->first()->unit_cost);
    }
}
