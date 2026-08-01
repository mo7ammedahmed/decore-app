<?php

namespace Database\Factories;

use App\Models\Classification;
use App\Models\Material;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Material>
 */
class MaterialFactory extends Factory
{
    public function definition(): array
    {
        // Unique suffix keeps the slug unique without Faker's per-process
        // unique() pool, which exhausts on small option lists.
        $name = fake()->randomElement([
            'Walnut Veneer Panel',
            'Carrara Marble Sheet',
            'Brushed Oak Profile',
            'Matte Black Wall Panel',
            'Travertine Flooring Tile',
            'Smoked Grey Profile',
            'White Marble Slab',
            'Teak Wood Panel',
        ]);
        $suffix = fake()->unique()->numberBetween(1, 999999);

        return [
            'supplier_id' => Supplier::factory(),
            'classification_id' => Classification::factory(),
            'name_en' => $name,
            'slug' => Str::slug($name).'-'.$suffix,
            'sku' => 'MAT-'.strtoupper(Str::random(8)),
            'description' => fake()->optional()->paragraph(),
            'unit' => fake()->randomElement(['piece', 'square_meter', 'meter', 'box', 'sheet']),
            'selling_price' => fake()->randomFloat(2, 15, 1200),
            'default_supplier_cost' => fake()->randomFloat(2, 5, 800),
            'currency_code' => 'SAR',
            'stock_quantity' => fake()->optional(0.8)->numberBetween(0, 500),
            'minimum_stock_level' => fake()->optional(0.6)->numberBetween(5, 50),
            'is_active' => true,
        ];
    }
}
