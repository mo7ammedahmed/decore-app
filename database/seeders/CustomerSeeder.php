<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $creator = User::query()->where('role', 'admin')->first()
            ?? User::factory()->admin()->create();

        $customers = [
            ['name' => 'Abdullah Saleh', 'company_name' => 'Nakhil Interiors', 'phone' => '0552001111', 'city' => 'Riyadh'],
            ['name' => 'Mona Fahad', 'company_name' => 'Mona Designs Studio', 'phone' => '0552002222', 'city' => 'Jeddah'],
            ['name' => 'Yousef Nasser', 'company_name' => null, 'phone' => '0552003333', 'city' => 'Dammam'],
            ['name' => 'Layla Hassan', 'company_name' => 'Layla Home Co.', 'phone' => '0552004444', 'city' => 'Riyadh'],
            ['name' => 'Hamad Ali', 'company_name' => null, 'phone' => '0552005555', 'city' => 'Khobar'],
            ['name' => 'Noura Khalid', 'company_name' => 'Noura Contracting', 'phone' => '0552006666', 'city' => 'Jeddah'],
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['name' => $customer['name'], 'phone' => $customer['phone']],
                [...$customer, 'email' => str_replace(' ', '.', strtolower($customer['name'])).'@example.test', 'created_by' => $creator->id]
            );
        }
    }
}
