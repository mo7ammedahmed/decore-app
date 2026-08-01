<?php

namespace App\Services;

use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Support\Money;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class CurrencyService
{
    /**
     * Exchange rate used to convert 1 unit of $quote into the base currency.
     * A rate of "1" is returned for the base currency itself.
     */
    public function rateFor(string $quote, string|CarbonInterface $date, ?string $base = null): string
    {
        $base ??= $this->baseCode();
        $date = (string) $date instanceof CarbonInterface ? $date->toDateString() : $date;

        if ($quote === $base) {
            return '1.00000000';
        }

        $rate = ExchangeRate::query()
            ->where('base_currency_code', $base)
            ->where('quote_currency_code', $quote)
            ->whereDate('effective_date', '<=', $date)
            ->orderByDesc('effective_date')
            ->value('rate');

        return $rate ?? '1.00000000';
    }

    /**
     * Convert an amount from $quote currency to the base currency.
     */
    public function convert(string|int|float $amount, string $quote, string|CarbonInterface $date, ?string $base = null): string
    {
        return Money::round(Money::mul($amount, $this->rateFor($quote, $date, $base)));
    }

    public function baseCode(): string
    {
        return Currency::query()->where('is_base', true)->value('code') ?? 'SAR';
    }

    public function baseCurrency(): Currency
    {
        return Currency::query()->where('is_base', true)->first() ?? Currency::query()->firstOrFail();
    }

    /**
     * Mark a currency as the single base currency.
     */
    public function setBase(Currency $currency): void
    {
        DB::transaction(function () use ($currency): void {
            Currency::query()->where('is_base', true)->update(['is_base' => false]);
            $currency->update(['is_base' => true]);
        });
    }
}
