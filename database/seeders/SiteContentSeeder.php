<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        // Keys are seeded empty (null) so the code dictionaries remain the
        // defaults; the admin editor writes overrides on top. firstOrCreate
        // keeps this idempotent and never clobbers admin edits.
        foreach (SiteContent::CONTENT_KEYS as $key) {
            SiteContent::query()->firstOrCreate(
                ['key' => $key],
                ['value_en' => null, 'value_ar' => null],
            );
        }
    }
}
