<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('color_id')->nullable()->constrained('material_colors')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('classification_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 2);
            $table->string('unit', 30)->default('piece');
            $table->decimal('unit_price', 16, 2);
            $table->decimal('unit_cost', 16, 2)->default(0);
            $table->decimal('discount_amount', 16, 2)->default(0);
            $table->decimal('tax_rate', 6, 3)->default(0);
            $table->decimal('tax_amount', 16, 2)->default(0);
            $table->decimal('line_subtotal', 16, 2)->default(0);
            $table->decimal('line_total', 16, 2)->default(0);
            $table->decimal('base_unit_price', 16, 2)->default(0);
            $table->decimal('base_unit_cost', 16, 2)->default(0);
            $table->decimal('base_line_total', 16, 2)->default(0);
            $table->timestamps();

            $table->index('material_id');
            $table->index('color_id');
            $table->index('supplier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
