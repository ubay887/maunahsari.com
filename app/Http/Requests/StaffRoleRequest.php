<?php

namespace App\Http\Requests;

use App\AdminRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['role' => ['required', Rule::enum(AdminRole::class)]];
    }
}
