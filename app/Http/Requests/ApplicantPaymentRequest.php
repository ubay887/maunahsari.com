<?php

namespace App\Http\Requests;

use App\Services\PsbDate;
use Illuminate\Foundation\Http\FormRequest;

class ApplicantPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('applicant')) ?? false;
    }

    protected function prepareForValidation(): void
    {
        foreach (['paid_at'] as $field) {
            if ($this->filled($field)) {
                $this->merge([$field => PsbDate::utcInput($this->input($field))]);
            }
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['amount' => ['required', 'integer', 'min:1', 'max:999999999999'], 'paid_at' => ['required', 'date', 'before_or_equal:now'], 'note' => ['nullable', 'string', 'max:5000']];
    }
}
