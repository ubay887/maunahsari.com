<?php

namespace App\Http\Requests\Alumni;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QueryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = ['search' => ['nullable', 'string', 'max:100'], 'sort' => ['nullable', Rule::in(['full_name', 'angkatan', 'created_at', 'verification_status'])], 'direction' => ['nullable', Rule::in(['asc', 'desc'])], 'page' => ['nullable', 'integer', 'min:1'], 'per_page' => ['nullable', 'integer', Rule::in([10, 20, 25, 50])], 'radius' => ['nullable', 'integer', Rule::in([25, 50, 100])], 'region_level' => ['nullable', Rule::in(['province', 'regency'])], 'region_id' => ['nullable', 'integer', 'min:1']];
        foreach (['angkatan', 'verification_status', 'pondok', 'province_id', 'regency_id', 'source', 'profession', 'program_id', 'open_to'] as $field) {
            $rules[$field] = ['nullable', 'string', 'max:100'];
        }

        return $rules;
    }
}
