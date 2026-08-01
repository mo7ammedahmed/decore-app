<?php

namespace Database\Seeders;

use App\Enums\InvoiceStatus;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Payment;
use App\Models\TaxRate;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(InvoiceService::class);
        $payments = app(PaymentService::class);

        $sales = User::query()->where('role', 'sales_staff')->first()
            ?? User::factory()->salesStaff()->create();
        $accountant = User::query()->where('role', 'accountant')->first()
            ?? User::factory()->accountant()->create();

        $customers = Customer::query()->limit(4)->get();
        $materials = Material::query()->limit(6)->get();
        $defaultTax = TaxRate::query()->default()->first() ?? TaxRate::factory()->create(['is_default' => true]);
        $base = \App\Models\Currency::query()->where('is_base', true)->value('code') ?? 'SAR';

        $scenarios = [
            // [status, payments count, days ago]
            ['status' => InvoiceStatus::Draft->value, 'payments' => 0, 'daysAgo' => 1],
            ['status' => InvoiceStatus::Issued->value, 'payments' => 0, 'daysAgo' => 12],
            ['status' => InvoiceStatus::Issued->value, 'payments' => 1, 'daysAgo' => 20],
            ['status' => InvoiceStatus::Completed->value, 'payments' => 2, 'daysAgo' => 34],
            ['status' => InvoiceStatus::Completed->value, 'payments' => 1, 'daysAgo' => 50],
            ['status' => InvoiceStatus::Cancelled->value, 'payments' => 0, 'daysAgo' => 6],
        ];

        foreach ($scenarios as $index => $scenario) {
            $customer = $customers[$index % count($customers)];
            $issueDate = now()->subDays($scenario['daysAgo'])->toDateString();
            $lineItems = $this->randomItems($materials, $index, $defaultTax->rate);

            $invoice = $service->create([
                'customer_id' => $customer->id,
                'issue_date' => $issueDate,
                'due_date' => now()->subDays($scenario['daysAgo'])->addDays(14)->toDateString(),
                'currency_code' => $base,
                'discount_type' => $index % 3 === 0 ? 'percentage' : 'none',
                'discount_value' => $index % 3 === 0 ? 5 : 0,
                'notes' => 'Seeded example invoice '.($index + 1),
            ], $lineItems, $sales);

            if ($scenario['status'] === InvoiceStatus::Draft->value) {
                continue;
            }

            $service->issue($invoice, $sales);

            if ($scenario['status'] === InvoiceStatus::Cancelled->value) {
                $service->cancel($invoice, $accountant);
                continue;
            }

            // Partial / full / over payments.
            foreach (range(1, $scenario['payments']) as $paymentIndex) {
                $proportion = $scenario['payments'] === 1 ? 0.5 : (0.4 + ($paymentIndex - 1) * 0.3);
                $amount = (string) round(((float) $invoice->total) * $proportion, 2);

                $payments->record($invoice, [
                    'amount' => $amount,
                    'payment_method' => ['cash', 'bank_transfer', 'card'][($paymentIndex + $index) % 3],
                    'paid_at' => now()->subDays($scenario['daysAgo'] - 1)->format('Y-m-d H:i:s'),
                    'reference' => 'SEED-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT).'-'.$paymentIndex,
                ], $accountant);
            }

            if ($scenario['status'] === InvoiceStatus::Completed->value) {
                $service->complete($invoice, $accountant);
            }
        }

        // Recalculate any leftover placeholder totals (e.g. pre-existing rows).
        foreach (Invoice::query()->where('total', 0)->get() as $invoice) {
            if ($invoice->items()->count() === 0) {
                $invoice->delete();
            }
        }
    }

    /**
     * Build a random list of validated line item inputs.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function randomItems($materials, int $seed, string $taxRate): array
    {
        $items = [];
        $count = 1 + ($seed % 2);
        $tax = (string) ((float) $taxRate);

        foreach (range(0, $count - 1) as $offset) {
            $material = $materials[($seed + $offset) % count($materials)];

            $items[] = [
                'material_id' => $material->id,
                'quantity' => (string) (2 + (($seed + $offset) % 9)),
                'unit_price' => (string) $material->selling_price,
                'unit_cost' => null,
                'discount_amount' => '0.00',
                'tax_rate' => $tax,
                'description' => null,
            ];
        }

        return $items;
    }
}
