<?php

namespace Tests\Feature;

use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\User;
use App\Services\InvoiceService;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceServiceTest extends TestCase
{
    use RefreshDatabase;

    private InvoiceService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
        $this->service = app(InvoiceService::class);
    }

    private function material(float $price = 100.00, float $cost = 40.00): Material
    {
        return Material::factory()->create([
            'selling_price' => $price,
            'default_supplier_cost' => $cost,
            'currency_code' => 'SAR',
        ]);
    }

    private function create(User $user, array $items, array $attrs = []): Invoice
    {
        $customer = Customer::factory()->create(['created_by' => $user->id]);

        return $this->service->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'due_date' => '2026-07-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
            ...$attrs,
        ], $items, $user);
    }

    public function test_create_computes_totals_server_side(): void
    {
        $material = $this->material(price: 100.00, cost: 40.00);
        $user = User::factory()->admin()->create();

        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 2,
            'tax_rate' => 15,
        ]]);

        $this->assertSame(InvoiceStatus::Draft, $invoice->status);
        $this->assertSame(PaymentStatus::Unpaid, $invoice->payment_status);
        $this->assertSame('200.00', $invoice->subtotal);
        $this->assertSame('30.00', $invoice->tax_total);
        $this->assertSame('230.00', $invoice->total);
        $this->assertSame('230.00', $invoice->balance_due);
        $this->assertSame('200.00', $invoice->base_subtotal);
        $this->assertSame('230.00', $invoice->base_total);

        $item = $invoice->items->first();
        $this->assertSame('100.00', $item->unit_price);
        $this->assertSame('40.00', $item->unit_cost);
        $this->assertSame('200.00', $item->line_subtotal);
        $this->assertSame('30.00', $item->tax_amount);
        $this->assertSame('230.00', $item->line_total);

        $this->assertDatabaseHas('audit_logs', ['action' => 'invoice.created']);
    }

    public function test_create_applies_percentage_discount(): void
    {
        $material = $this->material(price: 100.00);
        $user = User::factory()->admin()->create();

        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 2,
            'tax_rate' => 15,
        ]], [
            'discount_type' => DiscountType::Percentage->value,
            'discount_value' => 10,
        ]);

        $this->assertSame('20.00', $invoice->discount_total);
        $this->assertSame('210.00', $invoice->total);
    }

    public function test_create_applies_fixed_discount(): void
    {
        $material = $this->material(price: 100.00);
        $user = User::factory()->admin()->create();

        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 2,
            'tax_rate' => 15,
        ]], [
            'discount_type' => DiscountType::Fixed->value,
            'discount_value' => 15.00,
        ]);

        $this->assertSame('15.00', $invoice->discount_total);
        $this->assertSame('215.00', $invoice->total);
    }

    public function test_sales_staff_cannot_influence_cost_snapshot(): void
    {
        $material = $this->material(price: 100.00, cost: 40.00);
        $sales = User::factory()->salesStaff()->create();

        $invoice = $this->create($sales, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'unit_cost' => '999.99',
            'tax_rate' => 0,
        ]]);

        // The client-provided cost must be ignored; the server cost is used.
        $this->assertSame('40.00', $invoice->items->first()->unit_cost);
    }

    public function test_accountant_can_provide_cost_snapshot(): void
    {
        $material = $this->material(price: 100.00, cost: 40.00);
        $accountant = User::factory()->accountant()->create();

        $invoice = $this->create($accountant, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'unit_cost' => '55.00',
            'tax_rate' => 0,
        ]]);

        $this->assertSame('55.00', $invoice->items->first()->unit_cost);
    }

    public function test_invoice_numbers_are_sequential(): void
    {
        $material = $this->material();
        $user = User::factory()->admin()->create();

        $first = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);
        $second = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);

        $this->assertMatchesRegularExpression('/^INV-\d{4}-\d{6}$/', $first->invoice_number);
        $this->assertNotSame($first->invoice_number, $second->invoice_number);
    }

    public function test_foreign_currency_invoice_converts_to_base(): void
    {
        $this->seedCurrencies(withUsdRate: true);

        $material = $this->material(price: 100.00);
        $user = User::factory()->admin()->create();
        $customer = Customer::factory()->create(['created_by' => $user->id]);

        $invoice = $this->service->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'currency_code' => 'USD',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 2,
            'tax_rate' => 15,
        ]], $user);

        $this->assertSame('USD', $invoice->currency_code);
        $this->assertSame('3.75000000', $invoice->exchange_rate);
        $this->assertSame('230.00', $invoice->total);
        $this->assertSame('750.00', $invoice->base_subtotal);
        $this->assertSame('862.50', $invoice->base_total);
    }

    public function test_issued_invoice_cannot_be_edited(): void
    {
        $material = $this->material();
        $user = User::factory()->admin()->create();
        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);

        $this->service->issue($invoice, $user);

        $this->expectException(DomainException::class);

        $this->service->update($invoice, [
            'customer_id' => $invoice->customer_id,
            'issue_date' => '2026-06-15',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 5,
            'tax_rate' => 0,
        ]], $user);
    }

    public function test_lifecycle_transitions(): void
    {
        $material = $this->material();
        $user = User::factory()->admin()->create();
        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);

        $this->service->issue($invoice, $user);
        $this->assertSame(InvoiceStatus::Issued, $invoice->fresh()->status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'invoice.issued']);

        $this->service->complete($invoice, $user);
        $this->assertSame(InvoiceStatus::Completed, $invoice->fresh()->status);

        // Completed invoices cannot be cancelled.
        try {
            $this->service->cancel($invoice, $user);
            $this->fail('Expected DomainException for cancelling a completed invoice.');
        } catch (DomainException) {
            $this->assertSame(InvoiceStatus::Completed, $invoice->fresh()->status);
        }
    }

    public function test_only_drafts_can_be_issued(): void
    {
        $material = $this->material();
        $user = User::factory()->admin()->create();
        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);

        $this->service->issue($invoice, $user);

        $this->expectException(DomainException::class);
        $this->service->issue($invoice, $user);
    }

    public function test_cancelled_invoice_cannot_be_completed(): void
    {
        $material = $this->material();
        $user = User::factory()->admin()->create();
        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);

        $this->service->issue($invoice, $user);
        $this->service->cancel($invoice, $user);

        $this->expectException(DomainException::class);
        $this->service->complete($invoice, $user);
    }

    public function test_only_drafts_can_be_hard_deleted(): void
    {
        $material = $this->material();
        $user = User::factory()->admin()->create();
        $draft = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);

        $this->service->deleteDraft($draft, $user);
        $this->assertDatabaseMissing('invoices', ['id' => $draft->id]);

        $issued = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);
        $this->service->issue($issued, $user);

        $this->expectException(DomainException::class);
        $this->service->deleteDraft($issued, $user);
    }

    public function test_update_replaces_items_and_recalculates(): void
    {
        $material = $this->material(price: 100.00);
        $user = User::factory()->admin()->create();
        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 2,
            'tax_rate' => 15,
        ]]);
        $this->assertSame('230.00', $invoice->total);

        $this->service->update($invoice, [
            'customer_id' => $invoice->customer_id,
            'issue_date' => '2026-06-15',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 3,
            'tax_rate' => 15,
        ]], $user);

        $invoice->refresh();
        $this->assertSame(1, $invoice->items()->count());
        $this->assertSame('345.00', $invoice->total);
        $this->assertDatabaseHas('audit_logs', ['action' => 'invoice.updated']);
    }

    public function test_audit_log_never_stores_passwords_or_credentials(): void
    {
        $material = $this->material();
        $user = User::factory()->admin()->create();
        $invoice = $this->create($user, [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]]);

        $log = AuditLog::query()->where('action', 'invoice.created')->firstOrFail();
        $this->assertSame($invoice->id, $log->auditable_id);
        $this->assertSame('App\Models\Invoice', $log->auditable_type);
        $this->assertArrayNotHasKey('password', (array) $log->new_values);
    }
}
