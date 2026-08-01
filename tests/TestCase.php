<?php

namespace Tests;

use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Seed the standard currency set (SAR base) with an optional USD rate.
     */
    protected function seedCurrencies(bool $withUsdRate = false): void
    {
        // Clear rates first so the FK from exchange_rates never blocks the reset.
        ExchangeRate::query()->delete();
        Currency::query()->delete();

        Currency::create([
            'code' => 'SAR', 'name' => 'Saudi Riyal', 'symbol' => 'ر.س',
            'decimal_places' => 2, 'is_base' => true, 'is_active' => true,
        ]);

        Currency::create([
            'code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$',
            'decimal_places' => 2, 'is_base' => false, 'is_active' => true,
        ]);

        if ($withUsdRate) {
            ExchangeRate::create([
                'base_currency_code' => 'SAR',
                'quote_currency_code' => 'USD',
                'rate' => '3.75000000',
                'effective_date' => now()->subYear()->toDateString(),
            ]);
        }
    }
}
