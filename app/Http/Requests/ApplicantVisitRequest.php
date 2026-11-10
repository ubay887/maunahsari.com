<?php

namespace App\Http\Requests;

use App\Services\PsbDate;
use Illuminate\Foundation\Http\FormRequest;

class ApplicantVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('applicant')) ?? false;
    }

    protected function prepareForValidation(): void
    {
        foreach (['visit_scheduled_at', 'visited_at', 'sowan_done_at'] as $field) {
            if ($this->filled($field)) {
                $this->merge([$field => PsbDate::utcInput($this->input($field))]);
            }
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['visit_scheduled_at' => ['nullable', 'date'], 'visited_at' => ['nullable', 'date', 'before_or_equal:now'], 'sowan_done_at' => ['nullable', 'date', 'before_or_equal:now'], 'admin_note' => ['nullable', 'string', 'max:10000']];
    }
}
