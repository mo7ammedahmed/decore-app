<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'company_name' => fake()->optional(0.5)->company(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('05#######'),
            'tax_number' => fake()->optional(0.6)->numerify('3#############'),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country_code' => 'SA',
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
