<?php

namespace App\Http\Requests;

use App\Models\SiteContent;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Policies enforce admin-only access.
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'array'],
            'content.*.en' => ['nullable', 'string', 'max:2000'],
            'content.*.ar' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => trans('validation.app.content_required'),
        ];
    }

    /**
     * Only allow keys the application actually renders on public pages —
     * anything else is dropped before validation/upsert.
     */
    public function validatedContent(): array
    {
        $allowed = array_flip(SiteContent::CONTENT_KEYS);

        return array_intersect_key($this->validated('content') ?? [], $allowed);
    }
}
