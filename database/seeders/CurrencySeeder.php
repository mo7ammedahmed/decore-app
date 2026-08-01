<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['code' => 'SAR', 'name' => 'Saudi Riyal', 'symbol' => 'ر.س', 'decimal_places' => 2, 'is_base' => true],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'decimal_places' => 2, 'is_base' => false],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'decimal_places' => 2, 'is_base' => false],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(['code' => $currency['code']], $currency);
        }

        // Illustrative rates: 1 quote unit expressed in base (SAR) units.
        $rates = [
            ['base_currency_code' => 'SAR', 'quote_currency_code' => 'USD', 'rate' => '3.75000000'],
            ['base_currency_code' => 'SAR', 'quote_currency_code' => 'EUR', 'rate' => '4.20000000'],
        ];

        foreach ($rates as $rate) {
            ExchangeRate::updateOrCreate(
                [
                    'base_currency_code' => $rate['base_currency_code'],
                    'quote_currency_code' => $rate['quote_currency_code'],
                    'effective_date' => now()->startOfYear()->toDateString(),
                ],
                $rate
            );
        }
    }
}
