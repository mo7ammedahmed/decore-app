<?php

namespace Tests\Feature;

use App\Enums\DiscountType;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Material;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    private InvoiceService $invoices;

    private PaymentService $payments;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
        $this->invoices = app(InvoiceService::class);
        $this->payments = app(PaymentService::class);
    }

    private function issuedInvoice(User $user, float $total = 230.00): \App\Models\Invoice
    {
        $material = Material::factory()->create([
            'selling_price' => $total,
            'default_supplier_cost' => $total * 0.4,
            'currency_code' => 'SAR',
        ]);

        $customer = Customer::factory()->create(['created_by' => $user->id]);

        $invoice = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'due_date' => '2026-07-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]], $user);

        $this->invoices->issue($invoice, $user);

        return $invoice->fresh();
    }

    private function attributes(float $amount, array $overrides = []): array
    {
        return [
            'amount' => $amount,
            'payment_method' => 'bank_transfer',
            'paid_at' => '2026-06-20 10:00:00',
            ...$overrides,
        ];
    }

    public function test_record_updates_paid_total_balance_and_status(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $this->payments->record($invoice, $this->attributes(100.00), $user);
        $invoice->refresh();

        $this->assertSame('100.00', $invoice->paid_total);
        $this->assertSame('130.00', $invoice->balance_due);
        $this->assertSame(PaymentStatus::Partial, $invoice->payment_status);

        $this->payments->record($invoice, $this->attributes(130.00), $user);
        $invoice->refresh();

        $this->assertSame('230.00', $invoice->paid_total);
        $this->assertSame('0.00', $invoice->balance_due);
        $this->assertSame(PaymentStatus::Paid, $invoice->payment_status);
    }

    public function test_overpayment_sets_overpaid_status(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $this->payments->record($invoice, $this->attributes(250.00), $user);
        $invoice->refresh();

        $this->assertSame('250.00', $invoice->paid_total);
        $this->assertSame(PaymentStatus::Overpaid, $invoice->payment_status);
        $this->assertSame('-20.00', $invoice->balance_due);
    }

    public function test_payment_number_is_generated_and_sequential(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $first = $this->payments->record($invoice, $this->attributes(50.00), $user);
        $second = $this->payments->record($invoice, $this->attributes(50.00), $user);

        $this->assertMatchesRegularExpression('/^PAY-\d{4}-\d{6}$/', $first->payment_number);
        $this->assertNotSame($first->payment_number, $second->payment_number);
    }

    public function test_zero_amount_is_rejected(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('greater than zero');

        $this->payments->record($invoice, $this->attributes(0), $user);
    }

    public function test_cancelled_invoice_rejects_payments(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $this->invoices->cancel($invoice, $user);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('cancelled');

        $this->payments->record($invoice->fresh(), $this->attributes(100.00), $user);
    }

    public function test_draft_invoice_rejects_payments(): void
    {
        $user = User::factory()->accountant()->create();
        $material = Material::factory()->create([
            'selling_price' => 230.00,
            'default_supplier_cost' => 92.00,
            'currency_code' => 'SAR',
        ]);
        $customer = Customer::factory()->create(['created_by' => $user->id]);

        $draft = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]], $user);

        $this->expectException(DomainException::class);

        $this->payments->record($draft, $this->attributes(100.00), $user);
    }

    public function test_reversal_restores_balance_and_records_user(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $payment = $this->payments->record($invoice, $this->attributes(230.00), $user);
        $invoice->refresh();
        $this->assertSame(PaymentStatus::Paid, $invoice->payment_status);

        $this->payments->reverse($payment, $user);
        $invoice->refresh();

        $this->assertNotNull($payment->fresh()->reversed_at);
        $this->assertSame($user->id, $payment->fresh()->reversed_by);
        $this->assertSame('0.00', $invoice->paid_total);
        $this->assertSame('230.00', $invoice->balance_due);
        $this->assertSame(PaymentStatus::Unpaid, $invoice->payment_status);
    }

    public function test_double_reversal_is_rejected(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $payment = $this->payments->record($invoice, $this->attributes(100.00), $user);
        $this->payments->reverse($payment, $user);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('already been reversed');

        $this->payments->reverse($payment, $user);
    }

    public function test_reversal_does_not_delete_the_record(): void
    {
        $user = User::factory()->accountant()->create();
        $invoice = $this->issuedInvoice($user);

        $payment = $this->payments->record($invoice, $this->attributes(100.00), $user);
        $paymentId = $payment->id;
        $this->payments->reverse($payment, $user);

        $this->assertDatabaseHas('payments', ['id' => $paymentId]);
    }
}
