<?php

namespace App\Http\Requests\Submission;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'indicator_id' => ['required', 'integer', 'exists:indicators,id'],
            'file'         => [
                'required',
                'file',
                'max:10240',  // 10MB max
                'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.max'         => 'File size must not exceed 10MB.',
            'file.mimes'       => 'File must be PDF, image, or Office document.',
            'indicator_id.exists' => 'Invalid indicator selected.',
        ];
    }
}
