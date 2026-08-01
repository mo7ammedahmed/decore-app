<?php

namespace Database\Seeders;

use App\Models\GallerySection;
use Illuminate\Database\Seeder;

class GallerySectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            ['name_en' => 'Wood Alternatives', 'name_ar' => 'بدائل الخشب', 'sort_order' => 10],
            ['name_en' => 'Marble Alternatives', 'name_ar' => 'بدائل الرخام', 'sort_order' => 20],
            ['name_en' => 'Wall Panels', 'name_ar' => 'ألواح الجدران', 'sort_order' => 30],
            ['name_en' => 'Flooring', 'name_ar' => 'الأرضيات', 'sort_order' => 40],
            ['name_en' => 'Decorative Profiles', 'name_ar' => 'البروفيلات الزخرفية', 'sort_order' => 50],
        ];

        foreach ($sections as $section) {
            GallerySection::query()->firstOrCreate(
                ['name_en' => $section['name_en']],
                [...$section, 'is_visible' => true],
            );
        }
    }
}
