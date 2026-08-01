<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGalleryImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The controller authorizes via policy.
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:8192'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'is_visible' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'The uploaded file is not a valid image.',
            'image.mimes' => 'Only JPEG, PNG and WebP images are accepted.',
            'image.max' => 'Gallery images must be 8MB or smaller.',
        ];
    }
}
