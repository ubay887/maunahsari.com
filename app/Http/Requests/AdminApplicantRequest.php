<?php

namespace App\Http\Requests;

use App\Models\Applicant;

class AdminApplicantRequest extends StoreApplicationRequest
{
    public function authorize(): bool
    {
        $applicant = $this->route('applicant');

        return $this->user()?->can($applicant instanceof Applicant ? 'update' : 'create', $applicant instanceof Applicant ? $applicant : Applicant::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = parent::rules();
        foreach (['documents', 'documents.ijazah', 'documents.kartu_keluarga', 'documents.pas_foto'] as $key) {
            $rules[$key][0] = 'nullable';
        }
        unset($rules['email'], $rules['password']);

        return $rules;
    }
}
