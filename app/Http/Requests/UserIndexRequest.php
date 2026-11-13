<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserIndexRequest extends FormRequest
{
    /** Peran yang dapat disaring: peran staf dan jenis akun non-staf. */
    public const ROLES = ['admin', 'editor', 'author', 'alumni', 'applicant'];

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', User::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', Rule::in(self::ROLES)],
            'sort' => ['nullable', Rule::in(['name', 'email', 'created_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
