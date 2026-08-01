<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classifications', function (Blueprint $table) {
            $table->renameColumn('name', 'name_en');
        });

        Schema::table('materials', function (Blueprint $table) {
            $table->renameColumn('name', 'name_en');
        });
    }

    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->renameColumn('name_en', 'name');
        });

        Schema::table('classifications', function (Blueprint $table) {
            $table->renameColumn('name_en', 'name');
        });
    }
};
