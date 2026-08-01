<?php

namespace App\Http\Requests;

use App\Models\ShopSetting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Policies enforce admin-only access.
    }

    public function rules(): array
    {
        $hex = ['regex:/^#[0-9a-fA-F]{6}$/'];
        $url = ['nullable', 'url', 'max:255'];

        return [
            // ---- Bilingual identity ----
            'shop_name' => ['required', 'string', 'max:120'],
            'name_ar' => ['nullable', 'string', 'max:120'],
            'role_en' => ['nullable', 'string', 'max:120'],
            'role_ar' => ['nullable', 'string', 'max:120'],
            'short_pitch_en' => ['nullable', 'string', 'max:500'],
            'short_pitch_ar' => ['nullable', 'string', 'max:500'],
            'bio_en' => ['nullable', 'string', 'max:5000'],
            'bio_ar' => ['nullable', 'string', 'max:5000'],

            // ---- Contact links ----
            'email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'location_en' => ['nullable', 'string', 'max:255'],
            'location_ar' => ['nullable', 'string', 'max:255'],
            'linkedin' => $url,
            'github' => $url,
            'whatsapp' => $url,
            'website' => $url,
            'resume_url' => $url,

            // ---- Portrait + publishing ----
            'portrait' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:4096'],
            'remove_portrait' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],

            // ---- Contact email delivery ----
            'contact_notification_email' => ['nullable', 'email', 'max:254'],
            'contact_notification_subject_template' => ['nullable', 'string', 'max:255'],
            'contact_notification_body_template' => ['nullable', 'string', 'max:5000'],
            'contact_auto_reply_enabled' => ['nullable', 'boolean'],
            'contact_auto_reply_subject_template' => ['nullable', 'string', 'max:255'],
            'contact_auto_reply_body_template' => ['nullable', 'string', 'max:5000'],

            // ---- Theme palettes ----
            'theme_dark_accent' => ['required', ...$hex],
            'theme_dark_background' => ['required', ...$hex],
            'theme_dark_surface' => ['required', ...$hex],
            'theme_dark_foreground' => ['required', ...$hex],
            'theme_dark_muted' => ['required', ...$hex],
            'theme_light_accent' => ['required', ...$hex],
            'theme_light_background' => ['required', ...$hex],
            'theme_light_surface' => ['required', ...$hex],
            'theme_light_foreground' => ['required', ...$hex],
            'theme_light_muted' => ['required', ...$hex],
            'glass_effect_enabled' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'portrait.image' => 'The portrait must be an image file (JPEG, PNG or WebP).',
            'portrait.max' => 'The portrait must not be larger than 4 MB.',
            'theme_dark_accent.regex' => 'The accent colour must be a valid hex value, e.g. #8a6d3b.',
        ];
    }

    public function attributes(): array
    {
        return [
            'shop_name' => 'shop name',
            'theme_dark_accent' => 'dark accent colour',
            'theme_dark_background' => 'dark background colour',
            'theme_light_accent' => 'light accent colour',
        ];
    }
}
