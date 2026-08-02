<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // The controller authorizes image management on the material.
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
            'image.image' => trans('validation.app.image_invalid'),
            'image.mimes' => trans('validation.app.image_mimes'),
            'image.max' => trans('validation.app.image_max_2mb'),
        ];
    }
}
