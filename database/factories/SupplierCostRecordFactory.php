<?php

namespace Database\Factories;

use App\Models\Material;
use App\Models\Supplier;
use App\Models\SupplierCostRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplierCostRecord>
 */
class SupplierCostRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'material_id' => Material::factory(),
            'cost' => fake()->randomFloat(2, 5, 800),
            'currency_code' => 'SAR',
            'exchange_rate' => '1.00000000',
            'base_cost' => fn (array $attrs) => $attrs['cost'],
            'effective_from' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'effective_until' => null,
            'recorded_by' => User::factory(),
        ];
    }
}
