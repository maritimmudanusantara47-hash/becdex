<?php

namespace App\Http\Requests\Submission;

use Illuminate\Foundation\Http\FormRequest;

class BulkAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'answers'                  => ['required', 'array', 'min:1'],
            'answers.*.question_id'    => ['required', 'integer', 'exists:questions,id'],
            'answers.*.value'          => ['required', 'numeric', 'in:0,0.5,1,2'],
        ];
    }

    public function messages(): array
    {
        return [
            'answers.required'                  => 'At least one answer is required.',
            'answers.*.question_id.exists'      => 'One or more question IDs are invalid.',
            'answers.*.value.in'                => 'Answer value must be 0, 0.5, 1, or 2.',
        ];
    }
}
