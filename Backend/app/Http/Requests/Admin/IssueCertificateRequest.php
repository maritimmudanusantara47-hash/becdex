<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class IssueCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'certificate_id'    => ['required', 'integer', 'exists:certificates,id'],
            'becdex_category_id'=> ['required', 'integer', 'exists:becdex_categories,id'],
            'published_at'      => ['required', 'date'],
            'mmic'              => ['nullable', 'string', 'max:50'],
            'direktur'          => ['nullable', 'string', 'max:200'],
        ];
    }
}
