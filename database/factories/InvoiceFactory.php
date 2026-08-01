<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        $base = Currency::query()->where('is_base', true)->value('code') ?? 'SAR';

        return [
            'invoice_number' => 'INV-'.now()->format('Y').'-'.str_pad((string) fake()->unique()->numberBetween(1, 99999), 6, '0', STR_PAD_LEFT),
            'customer_id' => Customer::factory(),
            'created_by' => User::factory(),
            'issue_date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'due_date' => fn (array $attrs) => date('Y-m-d', strtotime('+14 days', strtotime($attrs['issue_date']))),
            'status' => InvoiceStatus::Draft->value,
            'payment_status' => 'unpaid',
            'currency_code' => 'SAR',
            'base_currency_code' => $base,
            'exchange_rate' => '1.00000000',
            'subtotal' => 0,
            'discount_type' => 'none',
            'discount_value' => 0,
            'discount_total' => 0,
            'tax_total' => 0,
            'total' => 0,
            'base_subtotal' => 0,
            'base_tax_total' => 0,
            'base_total' => 0,
            'paid_total' => 0,
            'balance_due' => 0,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => InvoiceStatus::Draft->value, 'payment_status' => 'unpaid']);
    }

    public function issued(): static
    {
        return $this->state(fn () => ['status' => InvoiceStatus::Issued->value]);
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => InvoiceStatus::Completed->value]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => InvoiceStatus::Cancelled->value]);
    }
}
