<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PsbRegionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'level' => ['required', Rule::in(['cities', 'districts', 'villages'])],
            'parent_code' => ['required', 'string', 'regex:/^[0-9]{2,7}$/D'],
        ];
    }
}
