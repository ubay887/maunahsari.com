<?php

namespace App\Http\Requests;

use App\Models\ProgramQuota;
use App\Pondok;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProgramQuotaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', ProgramQuota::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['registration_period_id' => ['required', 'integer', 'exists:registration_periods,id'], 'program_id' => ['required', 'integer', 'exists:programs,id'], 'pondok' => ['required', Rule::enum(Pondok::class)], 'capacity' => ['required', 'integer', 'min:0', 'max:100000'], 'is_open' => ['required', 'boolean']];
    }
}
