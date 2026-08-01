<?php

namespace App\Http\Requests;

use App\Models\ShopSetting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShopSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Policies enforce admin-only access.
    }

    public function rules(): array
    {
        return [
            'shop_name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:190'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'country_code' => ['nullable', 'string', 'size:2'],
            'tax_number' => ['nullable', 'string', 'max:60'],
            'commercial_registration' => ['nullable', 'string', 'max:60'],
            'invoice_template' => ['required', Rule::in(ShopSetting::INVOICE_TEMPLATES)],
            'invoice_accent' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'invoice_footer_note' => ['nullable', 'string', 'max:500'],
            'invoice_thank_you' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'remove_logo' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'logo.image' => 'The logo must be an image file (JPEG, PNG or WebP).',
            'logo.max' => 'The logo must not be larger than 2 MB.',
            'invoice_accent.regex' => 'The accent colour must be a valid hex value, e.g. #8a6d3b.',
        ];
    }
}
