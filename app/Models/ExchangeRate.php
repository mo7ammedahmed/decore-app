<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'base_currency_code', 'quote_currency_code', 'rate', 'effective_date',
])]
class ExchangeRate extends Model
{
    protected function casts(): array
    {
        return [
            'rate' => 'decimal:8',
            'effective_date' => 'date',
        ];
    }

    public function baseCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'base_currency_code', 'code');
    }

    public function quoteCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'quote_currency_code', 'code');
    }
}
