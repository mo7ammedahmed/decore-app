<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'recorded_by' => User::factory(),
            'payment_number' => 'PAY-'.now()->format('Y').'-'.str_pad((string) fake()->unique()->numberBetween(1, 99999), 6, '0', STR_PAD_LEFT),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'currency_code' => 'SAR',
            'exchange_rate' => '1.00000000',
            'base_amount' => fn (array $attrs) => $attrs['amount'],
            'payment_method' => fake()->randomElement(['cash', 'bank_transfer', 'card', 'cheque', 'other']),
            'paid_at' => fake()->dateTimeBetween('-2 months', 'now'),
            'reference' => fake()->optional()->bothify('REF-####'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
