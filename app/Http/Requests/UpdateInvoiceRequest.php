<?php

namespace App\Http\Requests;

use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $invoice = $this->route('invoice');

        return $invoice !== null
            && $invoice->status === InvoiceStatus::Draft
            && $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            // A customer_id is required unless a new customer is supplied inline.
            'customer_id' => ['nullable', 'integer', 'exists:customers,id', 'required_without:customer'],
            // Optional inline "quick add" customer, created atomically with the invoice.
            'customer' => ['nullable', 'array'],
            'customer.name' => ['required_with:customer', 'string', 'max:255'],
            'customer.company_name' => ['nullable', 'string', 'max:255'],
            'customer.email' => ['nullable', 'email', 'max:190'],
            'customer.phone' => ['nullable', 'string', 'max:40'],
            'customer.tax_number' => ['nullable', 'string', 'max:60'],
            'customer.address' => ['nullable', 'string', 'max:255'],
            'customer.city' => ['nullable', 'string', 'max:120'],
            'customer.country_code' => ['nullable', 'string', 'size:2'],
            'customer.notes' => ['nullable', 'string'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:issue_date'],
            'discount_type' => ['required', Rule::enum(DiscountType::class)],
            'discount_value' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.material_id' => ['required', 'integer', 'exists:materials,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0', 'max:999999'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'items.*.unit_cost' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Normalize empty strings in the inline customer, mirroring
     * StoreInvoiceRequest so optional fields are stored as null.
     */
    protected function prepareForValidation(): void
    {
        $customer = $this->input('customer');

        if (is_array($customer)) {
            foreach (['email', 'tax_number'] as $field) {
                if (($customer[$field] ?? null) === '') {
                    $customer[$field] = null;
                }
            }

            $this->merge(['customer' => $customer]);
        }
    }

    public function messages(): array
    {
        return [
            'items.required' => trans('validation.app.items_required'),
            'items.*.quantity.gt' => trans('validation.app.quantity_positive'),
            'customer.name.required_with' => trans('validation.app.customer_name_required'),
        ];
    }
}
