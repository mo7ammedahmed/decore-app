<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            // ---- Bilingual public identity ----
            $table->string('name_ar', 120)->nullable()->after('shop_name');
            $table->string('role_en', 120)->nullable();
            $table->string('role_ar', 120)->nullable();
            $table->string('short_pitch_en', 500)->nullable();
            $table->string('short_pitch_ar', 500)->nullable();
            $table->text('bio_en')->nullable();
            $table->text('bio_ar')->nullable();

            // ---- Contact links (public pages) ----
            $table->string('location_en', 255)->nullable();
            $table->string('location_ar', 255)->nullable();
            $table->string('linkedin', 255)->nullable();
            $table->string('github', 255)->nullable();
            $table->string('whatsapp', 255)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('resume_url', 255)->nullable();

            // ---- Portrait + publishing ----
            $table->string('portrait_path')->nullable();
            $table->boolean('is_published')->default(true);
            $table->boolean('is_available')->default(true);

            // ---- Contact email delivery ----
            $table->string('contact_notification_email', 254)->nullable();
            $table->string('contact_notification_subject_template', 255)->nullable();
            $table->text('contact_notification_body_template')->nullable();
            $table->boolean('contact_auto_reply_enabled')->default(true);
            $table->string('contact_auto_reply_subject_template', 255)->nullable();
            $table->text('contact_auto_reply_body_template')->nullable();

            // ---- Theme palettes (dark + light) + glass effect ----
            $table->string('theme_dark_accent', 9)->default('#8a6d3b');
            $table->string('theme_dark_background', 9)->default('#0a0a0a');
            $table->string('theme_dark_surface', 9)->default('#121212');
            $table->string('theme_dark_foreground', 9)->default('#f4f4f1');
            $table->string('theme_dark_muted', 9)->default('#a4a4a0');
            $table->string('theme_light_accent', 9)->default('#8a6d3b');
            $table->string('theme_light_background', 9)->default('#f4f3ee');
            $table->string('theme_light_surface', 9)->default('#ffffff');
            $table->string('theme_light_foreground', 9)->default('#0a0a0a');
            $table->string('theme_light_muted', 9)->default('#686864');
            $table->boolean('glass_effect_enabled')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            $table->dropColumn([
                'name_ar',
                'role_en',
                'role_ar',
                'short_pitch_en',
                'short_pitch_ar',
                'bio_en',
                'bio_ar',
                'location_en',
                'location_ar',
                'linkedin',
                'github',
                'whatsapp',
                'website',
                'resume_url',
                'portrait_path',
                'is_published',
                'is_available',
                'contact_notification_email',
                'contact_notification_subject_template',
                'contact_notification_body_template',
                'contact_auto_reply_enabled',
                'contact_auto_reply_subject_template',
                'contact_auto_reply_body_template',
                'theme_dark_accent',
                'theme_dark_background',
                'theme_dark_surface',
                'theme_dark_foreground',
                'theme_dark_muted',
                'theme_light_accent',
                'theme_light_background',
                'theme_light_surface',
                'theme_light_foreground',
                'theme_light_muted',
                'glass_effect_enabled',
            ]);
        });
    }
};
