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
            // Multi-upload: one or more files in an `images` array.
            'images' => ['nullable', 'required_without:image', 'array', 'max:20'],
            'images.*' => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:7168'],
            // Single-file upload (used by the replace action, and accepted
            // here for backwards compatibility).
            'image' => ['nullable', 'required_without:images', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:7168'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'is_visible' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ];
    }

    public function messages(): array
    {
        return [
            'images.required' => trans('validation.app.images_required'),
            'images.*.image' => trans('validation.app.image_invalid'),
            'images.*.mimes' => trans('validation.app.image_mimes'),
            'images.*.max' => trans('validation.app.gallery_image_max_7mb'),
            'image.image' => trans('validation.app.image_invalid'),
            'image.mimes' => trans('validation.app.image_mimes'),
            'image.max' => trans('validation.app.gallery_image_max_7mb'),
        ];
    }
}
