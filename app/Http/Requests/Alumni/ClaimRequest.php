<?php

namespace App\Http\Requests\Alumni;

use App\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class ClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Alumni;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['code' => ['required', 'string', 'regex:/^[A-Za-z0-9-]{32,80}$/']];
    }
}
