<?php

namespace App\Http\Requests;

use App\Models\Applicant;
use Illuminate\Support\Arr;

/** Biodata yang boleh diubah calon santri; periode, program, jenis kelamin, dan jenis santri tetap mengikuti pendaftaran. */
class PortalProfileRequest extends StoreApplicationRequest
{
    public function authorize(): bool
    {
        $applicant = $this->user()?->applicant;

        return $applicant instanceof Applicant && $this->user()->can('viewOwn', $applicant);
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $applicant = $this->user()?->applicant;
        if ($applicant instanceof Applicant) {
            $this->merge(['registration_period_id' => $applicant->registration_period_id, 'program_id' => $applicant->program_id, 'gender' => $applicant->gender, 'residence_type' => $applicant->residence_type->value]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return Arr::except(parent::rules(), ['documents', 'documents.ijazah', 'documents.kartu_keluarga', 'documents.pas_foto', 'website', 'email', 'password', 'agreed_to_rules']);
    }
}
