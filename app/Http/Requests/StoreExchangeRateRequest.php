<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExchangeRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'base_currency_code' => ['required', 'string', 'size:3', 'exists:currencies,code'],
            'quote_currency_code' => ['required', 'string', 'size:3', 'exists:currencies,code', 'different:base_currency_code'],
            'rate' => ['required', 'numeric', 'gt:0', 'max:999999999'],
            'effective_date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'quote_currency_code.different' => trans('validation.app.currencies_differ'),
            'rate.gt' => trans('validation.app.rate_positive'),
        ];
    }
}
