<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_settings', function (Blueprint $table) {
            $table->id();
            $table->string('shop_name', 120)->default('Decore');
            $table->string('tagline', 255)->nullable();
            $table->string('logo_path')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('email', 190)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('city', 120)->nullable();
            $table->string('country_code', 2)->nullable();
            $table->string('tax_number', 60)->nullable();
            $table->string('commercial_registration', 60)->nullable();
            // Printable invoice template style.
            $table->string('invoice_template', 20)->default('classic');
            $table->string('invoice_accent', 9)->default('#8a6d3b');
            $table->string('invoice_footer_note', 500)->nullable();
            $table->string('invoice_thank_you', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_settings');
    }
};
