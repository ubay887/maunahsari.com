<?php

namespace App\Http\Requests\Alumni;

use App\MapMode;
use App\Services\AlumniPrivacy;
use App\UserRole;
use App\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PrivacyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Alumni;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['map_mode' => ['required', Rule::enum(MapMode::class)], 'directory_visible' => ['required', 'boolean'], 'field_visibility' => ['required', 'array:'.implode(',', AlumniPrivacy::FIELDS)], 'field_visibility.*' => ['required', Rule::enum(Visibility::class)], 'privacy_consent' => ['accepted'], 'privacy_version' => ['required', Rule::in([config('alumni.privacy_version')])]];
    }
}
