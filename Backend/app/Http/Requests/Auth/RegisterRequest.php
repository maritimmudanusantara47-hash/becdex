<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            // Data perusahaan
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],

            // Data PIC (Person In Charge)
            'pic_name'         => ['required', 'string', 'max:255'],
            'pic_position'     => ['required', 'string', 'max:255'],
            'pic_email'        => ['required', 'email', 'max:255'],
            'pic_phone'        => ['required', 'string', 'max:50'],

            // Data perusahaan tambahan
            'company_phone'    => ['nullable', 'string', 'max:50'],
            'company_country'  => ['nullable', 'string', 'size:2'],
            'company_field_id' => ['nullable', 'integer', 'exists:company_fields,id'],

            // Terms & Conditions
            'terms_accepted'   => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'          => 'Email address is already registered.',
            'password.min'          => 'Password must be at least 8 characters.',
            'password.confirmed'    => 'Password confirmation does not match.',
            'terms_accepted.accepted' => 'You must accept the Terms and Conditions.',
            'company_field_id.exists' => 'Invalid company field selected.',
        ];
    }
}
