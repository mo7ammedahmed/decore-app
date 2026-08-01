<?php

namespace App\Services;

use App\Models\Material;
use App\Models\SupplierCostRecord;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class CostHistoryService
{
    public function __construct(private readonly CurrencyService $currencies) {}

    /**
     * Record a cost change for a material, closing any currently open record
     * so active cost periods never overlap.
     */
    public function recordChange(
        Material $material,
        string $cost,
        string $currencyCode,
        string|CarbonInterface $effectiveFrom,
        ?int $recordedBy = null,
    ): SupplierCostRecord {
        return DB::transaction(function () use ($material, $cost, $currencyCode, $effectiveFrom, $recordedBy) {
            $from = (string) $effectiveFrom instanceof CarbonInterface ? $effectiveFrom->toDateString() : $effectiveFrom;

            // Close only records that actually precede the new effective date,
            // so effective_until can never end up before effective_from.
            SupplierCostRecord::query()
                ->where('material_id', $material->id)
                ->whereNull('effective_until')
                ->whereDate('effective_from', '<', $from)
                ->update(['effective_until' => date('Y-m-d', strtotime($from.' -1 day'))]);

            $rate = $this->currencies->rateFor($currencyCode, $from);

            return SupplierCostRecord::create([
                'supplier_id' => $material->supplier_id,
                'material_id' => $material->id,
                'cost' => $cost,
                'currency_code' => $currencyCode,
                'exchange_rate' => $rate,
                'base_cost' => $this->currencies->convert($cost, $currencyCode, $from),
                'effective_from' => $from,
                'effective_until' => null,
                'recorded_by' => $recordedBy,
            ]);
        });
    }

    /**
     * Cost in effect for a material at a given date, or null when unknown.
     */
    public function costAt(Material $material, string|CarbonInterface $date): ?string
    {
        $date = (string) $date instanceof CarbonInterface ? $date->toDateString() : $date;

        return SupplierCostRecord::query()
            ->where('material_id', $material->id)
            ->whereDate('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_until')->orWhereDate('effective_until', '>=', $date);
            })
            ->latest('effective_from')
            ->value('cost');
    }
}
