<?php

namespace App\Http\Requests;

use App\Enums\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Per-route middleware and policies enforce ownership.
    }

    public function rules(): array
    {
        return [
            'supplier_id' => [
                'required',
                'integer',
                'exists:suppliers,id',
                // Supplier users may only create materials under their own supplier.
                Rule::when($this->user()?->isSupplier(), fn () => [
                    'in:'.$this->user()?->supplier_id,
                ]),
            ],
            'classification_id' => ['required', 'integer', 'exists:classifications,id'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('materials', 'slug')],
            'sku' => ['required', 'string', 'max:80', Rule::unique('materials', 'sku')],
            'description' => ['nullable', 'string'],
            'unit' => ['required', Rule::enum(Unit::class)],
            'selling_price' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'default_supplier_cost' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'currency_code' => ['required', 'string', 'size:3', 'exists:currencies,code'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'minimum_stock_level' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Normalise optional empty strings to null before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => $this->filled('slug') ? $this->input('slug') : null,
            'description' => $this->filled('description') ? $this->input('description') : null,
        ]);
    }
}
