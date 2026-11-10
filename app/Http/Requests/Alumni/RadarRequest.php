<?php

namespace App\Http\Requests\Alumni;

class RadarRequest extends QueryRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [...parent::rules(), 'regency_id' => ['nullable', 'integer', 'exists:regencies,id']];
    }
}
