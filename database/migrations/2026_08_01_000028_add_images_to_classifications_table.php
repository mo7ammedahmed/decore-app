<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classifications', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('description');
            $table->string('image_disk')->nullable()->after('image_path');
            $table->string('image_original_name')->nullable()->after('image_disk');
            $table->string('image_mime_type')->nullable()->after('image_original_name');
            $table->unsignedBigInteger('image_size')->nullable()->after('image_mime_type');
            $table->string('image_alt_text')->nullable()->after('image_size');
        });
    }

    public function down(): void
    {
        Schema::table('classifications', function (Blueprint $table) {
            $table->dropColumn([
                'image_path', 'image_disk', 'image_original_name',
                'image_mime_type', 'image_size', 'image_alt_text',
            ]);
        });
    }
};
