<?php

namespace Database\Factories;

use App\Models\GallerySection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GallerySection>
 */
class GallerySectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name_en' => fake()->unique()->words(2, true),
            'name_ar' => fake()->optional()->word(),
            'is_visible' => true,
            'sort_order' => 0,
        ];
    }
}
