<?php

namespace App\Http\Requests\Alumni;

use App\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class DeleteAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Alumni;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['password' => ['required', 'current_password'], 'confirmation' => ['required', 'in:HAPUS']];
    }
}
