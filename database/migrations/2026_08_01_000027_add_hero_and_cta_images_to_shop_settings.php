<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            // Admin-picked gallery images for the landing hero and the final
            // CTA background. Null = automatic (newest published image).
            $table->unsignedBigInteger('hero_image_id')->nullable();
            $table->unsignedBigInteger('cta_image_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            $table->dropColumn(['hero_image_id', 'cta_image_id']);
        });
    }
};
