<?php

namespace App\Http\Requests;

use App\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicantDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('applicant')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $photo = $this->input('type') === DocumentType::PasFoto->value;

        return ['type' => ['required', Rule::enum(DocumentType::class)], 'document' => $photo ? ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:2048'] : ['required', 'file', 'mimes:pdf', 'extensions:pdf', 'max:2048']];
    }
}
