<?php

namespace Database\Seeders;

use App\Models\ShopSetting;
use Illuminate\Database\Seeder;

class ShopSettingsSeeder extends Seeder
{
    public function run(): void
    {
        ShopSetting::query()->updateOrCreate(['id' => 1], [
            'shop_name' => 'Decore',
            'tagline' => 'Decoration materials atelier',
            'phone' => null,
            'email' => null,
            'address' => null,
            'city' => null,
            'country_code' => 'SA',
            'tax_number' => null,
            'commercial_registration' => null,
            'invoice_template' => 'classic',
            'invoice_accent' => '#8a6d3b',
            'invoice_footer_note' => null,
            'invoice_thank_you' => 'Thank you for your business',
        ]);
    }
}
