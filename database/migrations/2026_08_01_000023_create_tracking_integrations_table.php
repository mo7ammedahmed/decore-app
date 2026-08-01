<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracking_integrations', function (Blueprint $table): void {
            $table->id();
            $table->string('platform', 50);
            $table->string('tracking_id')->nullable();
            $table->string('installation_method', 20)->default('managed');
            $table->longText('head_code')->nullable();
            $table->longText('body_code')->nullable();
            $table->boolean('is_enabled')->default(false);
            $table->timestamps();

            $table->unique('platform');
            $table->index('is_enabled');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_integrations');
    }
};
