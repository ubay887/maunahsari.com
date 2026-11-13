<?php

namespace App\Http\Requests\Alumni;

class MapQueryRequest extends QueryRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return array_intersect_key(parent::rules(), array_flip(['angkatan', 'pondok', 'program_id', 'profession', 'region_id', 'region_level', 'page']));
    }
}
