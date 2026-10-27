<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @property string $published_at
 * @property string|null $direktur
 * @property int|null $certificate_id
 * @property int|null $becdex_category_id
 * @property string|null $mmic
 */
class IssueCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'published_at'      => ['required', 'date'],
            'direktur'          => ['nullable', 'string', 'max:200'],
            'certificate_id'    => ['nullable', 'integer', 'exists:certificates,id'],
            'becdex_category_id'=> ['nullable', 'integer', 'exists:becdex_categories,id'],
            'mmic'              => ['nullable', 'string', 'max:50'],
        ];
    }
}
