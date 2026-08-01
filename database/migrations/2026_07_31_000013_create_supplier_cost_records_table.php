<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplier_cost_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->restrictOnDelete();
            $table->foreignId('material_id')->constrained()->restrictOnDelete();
            $table->decimal('cost', 14, 2);
            $table->string('currency_code', 3);
            $table->decimal('exchange_rate', 18, 8)->default(1);
            $table->decimal('base_cost', 14, 2);
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['material_id', 'effective_from']);
            $table->index(['supplier_id', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_cost_records');
    }
};
