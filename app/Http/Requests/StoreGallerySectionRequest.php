<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGallerySectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The controller authorizes via policy.
    }

    public function rules(): array
    {
        return [
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'is_visible' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'description_en' => $this->filled('description_en') ? $this->input('description_en') : null,
            'description_ar' => $this->filled('description_ar') ? $this->input('description_ar') : null,
        ]);
    }
}
