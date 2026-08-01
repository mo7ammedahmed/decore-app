<?php

namespace Database\Seeders;

use App\Models\TaxRate;
use Illuminate\Database\Seeder;

class TaxRateSeeder extends Seeder
{
    public function run(): void
    {
        $taxes = [
            ['name' => 'VAT 15%', 'rate' => '15.000', 'is_default' => true],
            ['name' => 'VAT 5%', 'rate' => '5.000', 'is_default' => false],
            ['name' => 'Zero Rated', 'rate' => '0.000', 'is_default' => false],
        ];

        foreach ($taxes as $tax) {
            TaxRate::updateOrCreate(['name' => $tax['name']], [
                'rate' => $tax['rate'],
                'is_default' => $tax['is_default'],
                'is_active' => true,
            ]);
        }
    }
}
