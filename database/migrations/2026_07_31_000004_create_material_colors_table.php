<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
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
    }

    public function down(): void
    {
        Schema::dropIfExists('material_colors');
    }
};
