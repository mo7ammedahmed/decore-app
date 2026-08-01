<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Services\ProfitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfitTest extends TestCase
{
    use RefreshDatabase;

    private ProfitService $profit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->profit = app(ProfitService::class);
    }

    private function invoiceWithItem(array $itemOverrides = []): Invoice
    {
        $invoice = Invoice::factory()->issued()->create([
            'exchange_rate' => '1.00000000',
            'base_currency_code' => 'SAR',
            'currency_code' => 'SAR',
        ]);

        InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'quantity' => '2.00',
            'unit_price' => '100.00',
            'unit_cost' => '40.00',
            'discount_amount' => '0.00',
            'tax_rate' => '15.000',
            'tax_amount' => '30.00',
            'line_subtotal' => '200.00',
            'line_total' => '230.00',
            'base_unit_price' => '100.00',
            'base_unit_cost' => '40.00',
            'base_line_total' => '230.00',
            ...$itemOverrides,
        ]);

        return $invoice->load('items');
    }

    public function test_for_item_computes_gross_profit_and_margin(): void
    {
        $item = $this->invoiceWithItem()->items->first();

        $result = $this->profit->forItem($item);

        $this->assertSame('200.00', $result['revenue']);
        $this->assertSame('80.00', $result['cost']);
        $this->assertSame('120.00', $result['gross_profit']);
        $this->assertSame('60.00', $result['margin']);
    }

    public function test_margin_is_zero_when_revenue_is_zero(): void
    {
        // Zero revenue with a non-zero cost: gross profit is a loss, but the
        // margin must resolve to 0.00 instead of dividing by zero.
        $item = $this->invoiceWithItem([
            'unit_price' => '0.00',
            'line_subtotal' => '0.00',
            'line_total' => '0.00',
            'base_unit_price' => '0.00',
        ])->items->first();

        $result = $this->profit->forItem($item);

        $this->assertSame('-80.00', $result['gross_profit']);
        $this->assertSame('0.00', $result['margin']);
    }

    public function test_margin_handles_losses_without_division_errors(): void
    {
        $item = $this->invoiceWithItem([
            'unit_price' => '100.00',
            'unit_cost' => '150.00',
            'line_subtotal' => '200.00',
            'line_total' => '230.00',
            'base_unit_price' => '100.00',
            'base_unit_cost' => '150.00',
        ])->items->first();

        $result = $this->profit->forItem($item);

        $this->assertSame('-100.00', $result['gross_profit']);
        $this->assertSame('-50.00', $result['margin']);
    }

    public function test_for_invoice_uses_base_currency_amounts(): void
    {
        $invoice = $this->invoiceWithItem();

        $result = $this->profit->forInvoice($invoice);

        $this->assertSame('200.00', $result['revenue']);
        $this->assertSame('80.00', $result['cost']);
        $this->assertSame('120.00', $result['gross_profit']);
        $this->assertSame('60.00', $result['margin']);
    }

    public function test_for_invoice_respects_line_discounts(): void
    {
        $invoice = $this->invoiceWithItem([
            'discount_amount' => '20.00',
            'line_total' => '210.00',
            'base_line_total' => '210.00',
        ]);

        $result = $this->profit->forInvoice($invoice);

        $this->assertSame('180.00', $result['revenue']);
        $this->assertSame('80.00', $result['cost']);
        $this->assertSame('100.00', $result['gross_profit']);
    }

    public function test_aggregate_sums_across_invoices(): void
    {
        $invoiceA = $this->invoiceWithItem();
        $invoiceB = $this->invoiceWithItem();

        $result = $this->profit->aggregate(collect([$invoiceA, $invoiceB]));

        $this->assertSame('400.00', $result['revenue']);
        $this->assertSame('160.00', $result['cost']);
        $this->assertSame('240.00', $result['gross_profit']);
        $this->assertSame('60.00', $result['margin']);
    }

    public function test_aggregate_of_empty_set_is_zero(): void
    {
        $result = $this->profit->aggregate(collect());

        $this->assertSame('0.00', $result['revenue']);
        $this->assertSame('0.00', $result['cost']);
        $this->assertSame('0.00', $result['gross_profit']);
        $this->assertSame('0.00', $result['margin']);
    }

    public function test_model_helpers_match_the_service(): void
    {
        $item = $this->invoiceWithItem()->items->first();

        $this->assertSame('200.00', $item->revenueBeforeTax());
        $this->assertSame('80.00', $item->totalSupplierCost());
        $this->assertSame('120.00', $item->grossProfit());
        $this->assertSame('60.00', $item->grossProfitMargin());
    }
}
