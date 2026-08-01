<?php

namespace Database\Factories;

use App\Models\ExchangeRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExchangeRate>
 */
class ExchangeRateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'base_currency_code' => 'SAR',
            'quote_currency_code' => fake()->randomElement(['USD', 'EUR']),
            'rate' => fake()->randomElement(['3.75000000', '4.20000000']),
            'effective_date' => fake()->date(),
        ];
    }
}
