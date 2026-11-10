<?php

namespace App\Http\Requests;

use App\Services\PsbPhone;
use Illuminate\Foundation\Http\FormRequest;

class PsbStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('guardian_phone');
        $number = $this->input('registration_number');
        if (is_string($phone)) {
            $this->merge(['guardian_phone' => PsbPhone::normalize($phone)]);
        }
        if (is_string($number)) {
            $this->merge(['registration_number' => strtoupper(trim($number))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['registration_number' => ['required', 'string', 'max:100'], 'guardian_phone' => ['required', 'string', 'regex:/^628[1-9][0-9]{6,10}$/'], 'website' => ['nullable', 'string', 'max:0']];
    }
}
