<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Development-only credentials — never use these in production.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        $users = [
            ['name' => 'Admin Decore', 'email' => 'admin@decore.test', 'role' => UserRole::Admin->value],
            ['name' => 'Accountant Decore', 'email' => 'accountant@decore.test', 'role' => UserRole::Accountant->value],
            ['name' => 'Sales Staff Decore', 'email' => 'sales@decore.test', 'role' => UserRole::SalesStaff->value],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], [
                'name' => $user['name'],
                'password' => $password,
                'role' => $user['role'],
                'email_verified_at' => now(),
                'is_active' => true,
            ]);
        }

        // Two supplier users, each bound to one supplier.
        $suppliers = Supplier::query()->orderBy('id')->limit(2)->get();

        foreach ($suppliers as $index => $supplier) {
            User::updateOrCreate(['email' => 'supplier'.($index + 1).'@decore.test'], [
                'name' => 'Supplier '.($index + 1).' Decore',
                'password' => $password,
                'role' => UserRole::Supplier->value,
                'supplier_id' => $supplier->id,
                'email_verified_at' => now(),
                'is_active' => true,
            ]);
        }
    }
}
