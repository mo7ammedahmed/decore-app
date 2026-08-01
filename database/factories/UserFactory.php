<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => fake()->optional()->numerify('05#######'),
            'role' => UserRole::SalesStaff->value,
            'is_active' => true,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => UserRole::Admin->value]);
    }

    public function accountant(): static
    {
        return $this->state(fn () => ['role' => UserRole::Accountant->value]);
    }

    public function salesStaff(): static
    {
        return $this->state(fn () => ['role' => UserRole::SalesStaff->value]);
    }

    public function supplier(?Supplier $supplier = null): static
    {
        return $this->state(fn () => [
            'role' => UserRole::Supplier->value,
            'supplier_id' => $supplier?->id ?? Supplier::factory(),
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
