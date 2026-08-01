<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            // Per-section visibility for the public landing page. JSON object
            // of `section => bool` (e.g. {"featured": false}); null = all on.
            $table->json('landing_sections')->nullable();
            // Admin-curated featured finishes (ordered material ids). Empty or
            // null = fall back to the newest active materials.
            $table->json('featured_material_ids')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            $table->dropColumn(['landing_sections', 'featured_material_ids']);
        });
    }
};
