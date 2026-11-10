<?php

namespace App\Http\Requests\Alumni;

class AdminProfileRequest extends ProfileRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = parent::rules();
        foreach (['map_mode', 'directory_visible', 'field_visibility', 'field_visibility.*', 'privacy_consent', 'privacy_version'] as $field) {
            unset($rules[$field]);
        }

        return [...$rules, 'santri_id' => ['nullable', 'integer', 'exists:santris,id']];
    }
}
