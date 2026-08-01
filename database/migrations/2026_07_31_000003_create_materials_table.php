<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->restrictOnDelete();
            $table->foreignId('classification_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku', 80)->unique();
            $table->text('description')->nullable();
            $table->string('unit', 30)->default('piece');
            $table->decimal('selling_price', 14, 2)->default(0);
            $table->decimal('default_supplier_cost', 14, 2)->default(0);
            $table->string('currency_code', 3)->default('SAR');
            $table->unsignedBigInteger('stock_quantity')->nullable();
            $table->unsignedBigInteger('minimum_stock_level')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['supplier_id', 'is_active']);
            $table->index(['classification_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
