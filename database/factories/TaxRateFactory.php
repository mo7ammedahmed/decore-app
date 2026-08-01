<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TaxRate>
 */
class TaxRateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['VAT 15%', 'VAT 5%', 'Zero Rated', 'Exempt']),
            'rate' => fake()->randomElement(['15.000', '5.000', '0.000']),
            'is_default' => false,
            'is_active' => true,
        ];
    }
}
