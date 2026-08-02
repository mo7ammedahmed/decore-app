<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::enum(UserRole::class)],
            'supplier_id' => [
                'nullable',
                'integer',
                'exists:suppliers,id',
                Rule::requiredIf($this->input('role') === UserRole::Supplier->value),
            ],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            // Rule::requiredIf() compiles to the `required` rule, so the
            // custom message must be keyed `supplier_id.required` (a previous
            // `required_if` key silently fell back to the generic message).
            'supplier_id.required' => trans('validation.app.supplier_required_for_supplier'),
        ];
    }
}
