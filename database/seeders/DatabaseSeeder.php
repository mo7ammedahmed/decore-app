<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CurrencySeeder::class,
            TaxRateSeeder::class,
            ClassificationSeeder::class,
            SupplierSeeder::class,
            UserSeeder::class,
            CustomerSeeder::class,
            MaterialSeeder::class,
            CostHistorySeeder::class,
            InvoiceSeeder::class,
            ShopSettingsSeeder::class,
            SiteContentSeeder::class,
            GallerySectionSeeder::class,
        ]);
    }
}
