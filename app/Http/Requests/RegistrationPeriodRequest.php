<?php

namespace App\Http\Requests;

use App\Models\RegistrationPeriod;
use App\Services\PsbPhone;
use Illuminate\Foundation\Http\FormRequest;

class RegistrationPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', RegistrationPeriod::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        foreach (['putra', 'putri'] as $pondok) {
            $phone = $this->input('contact_whatsapp_'.$pondok);
            if (is_string($phone)) {
                $this->merge(['contact_whatsapp_'.$pondok => PsbPhone::normalize($phone)]);
            }
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = ['name' => ['required', 'string', 'max:255'], 'academic_year' => ['required', 'regex:/^20[0-9]{2}\/20[0-9]{2}$/'], 'is_open' => ['required', 'boolean'], 'opens_at' => ['required', 'date'], 'closes_at' => ['nullable', 'date', 'after:opens_at'], 'info_note' => ['nullable', 'string', 'max:20000']];
        foreach (['putra', 'putri'] as $pondok) {
            $rules['fee_url_'.$pondok] = ['nullable', 'url:https', 'max:2048', 'regex:~^https://drive\.google\.com(?:/|$)~'];
            $rules['contact_whatsapp_'.$pondok] = ['nullable', 'string', 'regex:/^628[1-9][0-9]{6,10}$/'];
        }

        return $rules;
    }
}
