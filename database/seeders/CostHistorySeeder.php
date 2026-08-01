<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\User;
use App\Services\CostHistoryService;
use Illuminate\Database\Seeder;

class CostHistorySeeder extends Seeder
{
    public function run(): void
    {
        $recorder = User::query()->where('role', 'admin')->first()
            ?? User::factory()->admin()->create();

        $service = app(CostHistoryService::class);

        foreach (Material::query()->get() as $material) {
            // Historical cost ~15% lower, effective until yesterday.
            $oldCost = (string) round(((float) $material->default_supplier_cost) * 0.85, 2);

            $service->recordChange(
                $material,
                $oldCost,
                $material->currency_code,
                now()->subMonths(3)->toDateString(),
                $recorder->id,
            );

            // Current cost effective from yesterday.
            $service->recordChange(
                $material,
                (string) $material->default_supplier_cost,
                $material->currency_code,
                now()->subDay()->toDateString(),
                $recorder->id,
            );
        }
    }
}
