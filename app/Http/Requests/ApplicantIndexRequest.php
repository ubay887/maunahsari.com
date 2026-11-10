<?php

namespace App\Http\Requests;

use App\ApplicantSource;
use App\ApplicantStatus;
use App\Models\Applicant;
use App\Pondok;
use App\ResidenceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicantIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Applicant::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['registration_period_id' => ['nullable', 'integer', 'exists:registration_periods,id'], 'program_id' => ['nullable', 'integer', 'exists:programs,id'], 'pondok' => ['nullable', Rule::enum(Pondok::class)], 'status' => ['nullable', Rule::enum(ApplicantStatus::class)], 'residence_type' => ['nullable', Rule::enum(ResidenceType::class)], 'source' => ['nullable', Rule::enum(ApplicantSource::class)], 'search' => ['nullable', 'string', 'max:255'], 'sort' => ['nullable', Rule::in(['registration_number', 'full_name', 'status', 'created_at'])], 'direction' => ['nullable', Rule::in(['asc', 'desc'])], 'per_page' => ['nullable', 'integer', 'min:5', 'max:50'], 'page' => ['nullable', 'integer', 'min:1']];
    }
}
