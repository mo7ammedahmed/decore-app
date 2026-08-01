<?php

namespace Database\Seeders;

use App\Models\Classification;
use App\Models\Material;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $classifications = Classification::query()->orderBy('sort_order')->get();
        $suppliers = Supplier::query()->orderBy('id')->get();

        $catalog = [
            ['name_en' => 'Walnut Veneer Panel', 'name_ar' => 'لوح قشرة الجوز', 'unit' => 'sheet', 'selling_price' => 420, 'default_supplier_cost' => 240],
            ['name_en' => 'Carrara Marble Sheet', 'name_ar' => 'لوح رخام كارارا', 'unit' => 'sheet', 'selling_price' => 680, 'default_supplier_cost' => 410],
            ['name_en' => 'Brushed Oak Profile', 'name_ar' => 'بروفيل بلوط مصقول', 'unit' => 'meter', 'selling_price' => 85, 'default_supplier_cost' => 48],
            ['name_en' => 'Matte Black Wall Panel', 'name_ar' => 'لوح جدران أسود مطفي', 'unit' => 'sheet', 'selling_price' => 260, 'default_supplier_cost' => 140],
            ['name_en' => 'Travertine Flooring Tile', 'name_ar' => 'بلاط ترافرتين للأرضيات', 'unit' => 'box', 'selling_price' => 190, 'default_supplier_cost' => 105],
            ['name_en' => 'Smoked Grey Decorative Profile', 'name_ar' => 'بروفيل رمادي مدخّن', 'unit' => 'meter', 'selling_price' => 95, 'default_supplier_cost' => 55],
        ];

        foreach ($catalog as $index => $entry) {
            $supplier = $suppliers[$index % count($suppliers)];
            $classification = $classifications[$index % count($classifications)];

            Material::updateOrCreate(
                ['slug' => Str::slug($entry['name_en'])],
                [
                    'supplier_id' => $supplier->id,
                    'classification_id' => $classification->id,
                    'name_en' => $entry['name_en'],
                    'name_ar' => $entry['name_ar'],
                    'sku' => 'SKU-'.strtoupper(Str::random(6)).'-'.($index + 1),
                    'unit' => $entry['unit'],
                    'selling_price' => $entry['selling_price'],
                    'default_supplier_cost' => $entry['default_supplier_cost'],
                    'currency_code' => 'SAR',
                    'stock_quantity' => 100 + ($index * 37),
                    'minimum_stock_level' => 40,
                    'is_active' => true,
                ]
            );
        }
    }
}
