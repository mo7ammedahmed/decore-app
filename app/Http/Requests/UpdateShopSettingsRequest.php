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
            // Landing-page structure controls. `landing_sections` is an assoc
            // array (section => bool); the key allowlist is enforced by
            // ShopSetting::landingSectionFlags() so unknown keys are ignored.
            'landing_sections' => ['nullable', 'array'],
            'landing_sections.*' => ['boolean'],
            'featured_material_ids' => ['nullable', 'array'],
            'featured_material_ids.*' => ['integer', 'exists:materials,id'],
            // Admin-picked landing images (null = automatic).
            'hero_image_id' => ['nullable', 'integer', 'exists:gallery_images,id'],
            'cta_image_id' => ['nullable', 'integer', 'exists:gallery_images,id'],
            // Structured bilingual landing content. Empty array = code defaults.
            'why_cards' => ['nullable', 'array'],
            'why_cards.*.title_en' => ['required', 'string', 'max:255'],
            'why_cards.*.title_ar' => ['nullable', 'string', 'max:255'],
            'why_cards.*.body_en' => ['required', 'string', 'max:1000'],
            'why_cards.*.body_ar' => ['nullable', 'string', 'max:1000'],
            'journey_steps' => ['nullable', 'array'],
            'journey_steps.*.title_en' => ['required', 'string', 'max:255'],
            'journey_steps.*.title_ar' => ['nullable', 'string', 'max:255'],
            'journey_steps.*.body_en' => ['required', 'string', 'max:1000'],
            'journey_steps.*.body_ar' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * The settings form is multipart (it also uploads the logo), so nested
     * booleans arrive as the strings "0"/"1" and ids as strings. Normalise
     * them here so the stored JSON holds real booleans / integers.
     */
    protected function prepareForValidation(): void
    {
        $sections = $this->input('landing_sections');

        if (is_array($sections)) {
            $this->merge([
                'landing_sections' => array_map(
                    fn ($value) => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                    $sections,
                ),
            ]);
        }

        $ids = $this->input('featured_material_ids');

        if (is_array($ids)) {
            $this->merge([
                'featured_material_ids' => array_map('intval', $ids),
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'logo.image' => trans('validation.app.logo_image'),
            'logo.max' => trans('validation.app.logo_max_2mb'),
            'invoice_accent.regex' => trans('validation.app.hex_accent'),
        ];
    }
}
