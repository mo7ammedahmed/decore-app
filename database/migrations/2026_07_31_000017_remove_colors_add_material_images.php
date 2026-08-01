<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Remove the color-variant domain entirely. Each material now carries its own
 * single product image directly on the materials row.
 *
 * This is a forward migration: both freshly-migrated databases (which created
 * material_colors / color_images from the original migrations) and already
 * migrated development databases converge on the same final schema.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Materials get their own single image.
        Schema::table('materials', function (Blueprint $table) {
            $table->string('image_disk', 30)->nullable()->after('is_active');
            $table->string('image_path')->nullable()->after('image_disk');
            $table->string('image_original_name')->nullable()->after('image_path');
            $table->string('image_mime_type', 60)->nullable()->after('image_original_name');
            $table->unsignedBigInteger('image_size')->nullable()->after('image_mime_type');
            $table->string('image_alt_text')->nullable()->after('image_size');
        });

        // Historical invoice items snapshot their own description; the color
        // reference is no longer meaningful once colors are gone.
        Schema::table('invoice_items', function (Blueprint $table) {
            if (Schema::hasColumn('invoice_items', 'color_id')) {
                $table->dropForeign(['color_id']);
                $table->dropIndex(['color_id']);
                $table->dropColumn('color_id');
            }
        });

        Schema::dropIfExists('color_images');
        Schema::dropIfExists('material_colors');
    }

    public function down(): void
    {
        Schema::create('material_colors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('code', 40)->nullable();
            $table->string('hex_value', 7)->nullable();
            $table->string('sku_suffix', 40)->nullable();
            $table->decimal('additional_price', 14, 2)->default(0);
            $table->unsignedBigInteger('stock_quantity')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['material_id', 'name']);
            $table->unique(['material_id', 'code']);
            $table->index('is_active');
        });

        Schema::create('color_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('color_id')->unique()->constrained('material_colors')->cascadeOnDelete();
            $table->string('disk', 30)->default('public');
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 60)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->string('alt_text')->nullable();
            $table->timestamps();
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->foreignId('color_id')->nullable()->after('material_id')->constrained('material_colors')->nullOnDelete();
            $table->index('color_id');
        });

        Schema::table('materials', function (Blueprint $table) {
            $table->dropColumn(['image_disk', 'image_path', 'image_original_name', 'image_mime_type', 'image_size', 'image_alt_text']);
        });
    }
};
