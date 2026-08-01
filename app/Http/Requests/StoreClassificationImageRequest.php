<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassificationImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The controller authorizes image management on the classification.
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'The uploaded file is not a valid image.',
            'image.mimes' => 'Only JPEG, PNG and WebP images are accepted.',
            'image.max' => 'Images must be 2MB or smaller.',
        ];
    }
}
