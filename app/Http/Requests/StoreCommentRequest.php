<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    $visibleText = trim(strip_tags($value));

                    if (mb_strlen($visibleText) < 1) {
                        $fail('A comment cannot be empty.');
                    }

                    if (mb_strlen($visibleText) > 2000) {
                        $fail('Comments may not exceed 2,000 visible characters.');
                    }
                },
            ],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ];
    }
}
