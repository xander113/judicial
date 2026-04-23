<?php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_id'    => ['required', 'exists:users,id'],
            'reason'     => ['required', 'string', 'min:1', 'max:1000'],
            'type'       => ['required', 'in:permanent,temporary'],
            'expires_at' => ['required_if:type,temporary', 'nullable', 'date', 'after:now'],
        ];
    }
}