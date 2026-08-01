<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'Al Noor Wood Industries',
                'company_name' => 'Al Noor Wood Industries LLC',
                'contact_person' => 'Khalid Al-Mutairi',
                'email' => 'sales@alnoor-wood.example',
                'phone' => '0551002001',
                'city' => 'Riyadh',
                'country_code' => 'SA',
            ],
            [
                'name' => 'Marble Master Trading',
                'company_name' => 'Marble Master Trading Co.',
                'contact_person' => 'Sara Al-Qahtani',
                'email' => 'info@marblemaster.example',
                'phone' => '0551002002',
                'city' => 'Jeddah',
                'country_code' => 'SA',
            ],
            [
                'name' => 'Decorative Panels Gulf',
                'company_name' => 'Decorative Panels Gulf FZCO',
                'contact_person' => 'Omar Haddad',
                'email' => 'hello@dpgulf.example',
                'phone' => '0551002003',
                'city' => 'Dubai',
                'country_code' => 'AE',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::updateOrCreate(['name' => $supplier['name']], [
                ...$supplier,
                'is_active' => true,
            ]);
        }
    }
}
