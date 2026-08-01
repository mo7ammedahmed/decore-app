<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('base_currency_code', 3);
            $table->string('quote_currency_code', 3);
            $table->decimal('rate', 18, 8);
            $table->date('effective_date');
            $table->timestamps();

            $table->unique(['base_currency_code', 'quote_currency_code', 'effective_date'], 'exchange_rates_pair_date_unique');

            $table->foreign('base_currency_code')->references('code')->on('currencies')->restrictOnDelete();
            $table->foreign('quote_currency_code')->references('code')->on('currencies')->restrictOnDelete();

            $table->index(['quote_currency_code', 'effective_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
