<?php

namespace App\Models;

use Database\Factories\InvoiceItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'invoice_id', 'material_id', 'supplier_id', 'classification_id',
    'description', 'quantity', 'unit', 'unit_price', 'unit_cost',
    'discount_amount', 'tax_rate', 'tax_amount', 'line_subtotal', 'line_total',
    'base_unit_price', 'base_unit_cost', 'base_line_total',
])]
class InvoiceItem extends Model
{
    /** @use HasFactory<InvoiceItemFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_rate' => 'decimal:3',
            'tax_amount' => 'decimal:2',
            'line_subtotal' => 'decimal:2',
            'line_total' => 'decimal:2',
            'base_unit_price' => 'decimal:2',
            'base_unit_cost' => 'decimal:2',
            'base_line_total' => 'decimal:2',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function classification(): BelongsTo
    {
        return $this->belongsTo(Classification::class);
    }

    /**
     * Revenue before tax for this line (after line-level discounts).
     */
    public function revenueBeforeTax(): string
    {
        return \App\Support\Money::sub($this->line_subtotal, $this->discount_amount);
    }

    /**
     * Total supplier cost for this line (uses the stored snapshot).
     */
    public function totalSupplierCost(): string
    {
        return \App\Support\Money::mul($this->unit_cost, $this->quantity);
    }

    /**
     * Gross profit for this line based on the historical cost snapshot.
     */
    public function grossProfit(): string
    {
        return \App\Support\Money::sub($this->revenueBeforeTax(), $this->totalSupplierCost());
    }

    /**
     * Gross profit margin percentage, safe against division by zero.
     */
    public function grossProfitMargin(): string
    {
        $revenue = $this->revenueBeforeTax();

        if ((float) $revenue == 0.0) {
            return '0.00';
        }

        return \App\Support\Money::div(\App\Support\Money::mul($this->grossProfit(), '100'), $revenue);
    }
}
