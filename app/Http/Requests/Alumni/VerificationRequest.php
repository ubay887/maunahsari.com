<?php

namespace App\Http\Requests\Alumni;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['status' => ['required', Rule::in(['approved', 'rejected'])], 'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:500'], 'santri_id' => ['nullable', 'integer', 'exists:santris,id']];
    }
}
