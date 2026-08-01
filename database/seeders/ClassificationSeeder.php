<?php

namespace Database\Seeders;

use App\Models\Classification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ClassificationSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            ['name_en' => 'Wood Alternatives', 'name_ar' => 'بدائل الخشب'],
            ['name_en' => 'Marble Alternatives', 'name_ar' => 'بدائل الرخام'],
            ['name_en' => 'Wall Panels', 'name_ar' => 'ألواح الجدران'],
            ['name_en' => 'Flooring', 'name_ar' => 'الأرضيات'],
            ['name_en' => 'Decorative Profiles', 'name_ar' => 'البروفيلات الزخرفية'],
        ];

        foreach ($names as $index => $entry) {
            Classification::updateOrCreate(['slug' => Str::slug($entry['name_en'])], [
                'name_en' => $entry['name_en'],
                'name_ar' => $entry['name_ar'],
                'description' => null,
                'is_active' => true,
                'sort_order' => $index + 1,
            ]);
        }
    }
}
