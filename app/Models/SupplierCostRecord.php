<?php

namespace App\Models;

use Database\Factories\SupplierCostRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'supplier_id', 'material_id', 'cost', 'currency_code', 'exchange_rate',
    'base_cost', 'effective_from', 'effective_until', 'recorded_by',
])]
class SupplierCostRecord extends Model
{
    /** @use HasFactory<SupplierCostRecordFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'exchange_rate' => 'decimal:8',
            'base_cost' => 'decimal:2',
            'effective_from' => 'date',
            'effective_until' => 'date',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function scopeActiveOn($query, string $date)
    {
        return $query->whereDate('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_until')
                    ->orWhereDate('effective_until', '>=', $date);
            });
    }
}
