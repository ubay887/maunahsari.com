<?php

namespace App\Http\Requests\Alumni;

use App\ActivityStatus;
use App\AlumniStatus;
use App\Pondok;
use Illuminate\Validation\Rule;

class ProfileRequest extends PrivacyRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [...parent::rules(),
            'full_name' => ['required', 'string', 'max:255'], 'gender' => ['required', Rule::in(['male', 'female'])],
            'phone_whatsapp' => ['nullable', 'regex:/^\+?[0-9]{9,16}$/'], 'entry_year' => ['required', 'integer', 'between:1900,'.date('Y')], 'leave_year' => ['nullable', 'integer', 'gte:entry_year', 'max:'.date('Y')],
            'pondok' => ['required', Rule::enum(Pondok::class)], 'program_id' => ['nullable', 'integer', 'exists:programs,id'], 'alumni_status' => ['required', Rule::enum(AlumniStatus::class)], 'angkatan' => ['required', 'string', 'max:40'],
            'province_id' => ['required', 'integer', 'exists:provinces,id'], 'regency_id' => ['required', 'integer', Rule::exists('regencies', 'id')->where('province_id', $this->input('province_id'))], 'activity_status' => ['required', Rule::enum(ActivityStatus::class)],
            'profession' => ['nullable', 'string', 'max:150'], 'organization' => ['nullable', 'string', 'max:150'], 'field' => ['nullable', 'string', 'max:150'], 'skills' => ['nullable', 'array', 'list', 'max:30'], 'skills.*' => ['string', 'max:80'], 'bio' => ['nullable', 'string', 'max:500'],
            'social_links' => ['nullable', 'array:website,linkedin,instagram'], 'social_links.*' => ['nullable', 'url:http,https', 'max:255'], 'open_to' => ['nullable', 'array', 'list', 'max:4'], 'open_to.*' => [Rule::in(['ready_to_help', 'seeking_job', 'hiring', 'mentoring'])], 'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=4096,max_height=4096'], 'remove_photo' => ['sometimes', 'boolean'],
        ];
    }
}
