<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 40)->unique();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('draft');
            $table->string('payment_status', 20)->default('unpaid');
            $table->string('currency_code', 3);
            $table->string('base_currency_code', 3);
            $table->decimal('exchange_rate', 18, 8)->default(1);
            $table->decimal('subtotal', 16, 2)->default(0);
            $table->string('discount_type', 20)->default('none');
            $table->decimal('discount_value', 14, 2)->default(0);
            $table->decimal('discount_total', 16, 2)->default(0);
            $table->decimal('tax_total', 16, 2)->default(0);
            $table->decimal('total', 16, 2)->default(0);
            $table->decimal('base_subtotal', 16, 2)->default(0);
            $table->decimal('base_tax_total', 16, 2)->default(0);
            $table->decimal('base_total', 16, 2)->default(0);
            $table->decimal('paid_total', 16, 2)->default(0);
            $table->decimal('balance_due', 16, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'payment_status']);
            $table->index('issue_date');
            $table->index(['created_by', 'status']);
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
