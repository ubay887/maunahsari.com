<?php

namespace App\Http\Requests;

use App\ApplicantStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicantStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('applicant')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['status' => ['required', Rule::enum(ApplicantStatus::class)], 'decision_reason' => ['nullable', 'required_if:status,rejected', 'string', 'max:5000']];
    }
}
