<?php

namespace Database\Factories;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Currency>
 */
class CurrencyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->randomElement(['SAR', 'USD', 'EUR']),
            'name' => fake()->randomElement(['Saudi Riyal', 'US Dollar', 'Euro']),
            'symbol' => fake()->randomElement(['ر.س', '$', '€']),
            'decimal_places' => 2,
            'is_base' => false,
            'is_active' => true,
        ];
    }
}
