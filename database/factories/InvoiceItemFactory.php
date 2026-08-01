<?php

namespace Database\Factories;

use App\Models\Classification;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'material_id' => Material::factory(),
            'supplier_id' => Supplier::factory(),
            'classification_id' => Classification::factory(),
            'description' => fake()->sentence(3),
            'quantity' => fake()->randomFloat(2, 1, 50),
            'unit' => 'piece',
            'unit_price' => fake()->randomFloat(2, 15, 900),
            'unit_cost' => fake()->randomFloat(2, 5, 600),
            'discount_amount' => 0,
            'tax_rate' => '15.000',
            'tax_amount' => 0,
            'line_subtotal' => 0,
            'line_total' => 0,
            'base_unit_price' => 0,
            'base_unit_cost' => 0,
            'base_line_total' => 0,
        ];
    }
}
