<?php

namespace App\Http\Requests;

use App\Models\Applicant;

class PortalDocumentRequest extends ApplicantDocumentRequest
{
    public function authorize(): bool
    {
        $applicant = $this->user()?->applicant;

        return $applicant instanceof Applicant && $this->user()->can('viewOwn', $applicant);
    }
}
