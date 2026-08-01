<?php

namespace Database\Factories;

use App\Models\Classification;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Classification>
 */
class ClassificationFactory extends Factory
{
    public function definition(): array
    {
        // A numeric suffix keeps the slug unique without relying on Faker's
        // per-process unique() pool, which exhausts on small option lists.
        $name = fake()->randomElement([
            'Wood Alternatives',
            'Marble Alternatives',
            'Wall Panels',
            'Flooring',
            'Decorative Profiles',
        ]);
        $suffix = fake()->unique()->numberBetween(1, 999999);

        return [
            'name_en' => $name,
            'slug' => Str::slug($name).'-'.$suffix,
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 50),
        ];
    }
}
