<?php

namespace App\Http\Requests;

use App\Models\SitePage;
use App\SitePageKey;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSitePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', SitePage::class) ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return match ($this->route('page')) {
            SitePageKey::Profile => $this->profileRules(),
            SitePageKey::Contact => $this->contactRules(),
            default => $this->pondokRules(),
        };
    }

    /** @return array<string, array<mixed>|string> */
    private function profileRules(): array
    {
        return [
            'history_html' => ['required', 'string', 'max:20000'],
            'location_html' => ['required', 'string', 'max:5000'],
            'founder' => ['required', 'array'],
            'founder.name' => ['required', 'string', 'max:255'],
            'founder.facts' => ['present', 'array', 'max:10'],
            'founder.facts.*.label' => ['required', 'string', 'max:120'],
            'founder.facts.*.value' => ['required', 'string', 'max:255'],
            'founder.bio_html' => ['required', 'string', 'max:20000'],
            'caretaker' => ['required', 'array'],
            'caretaker.period' => ['required', 'string', 'max:255'],
            'caretaker.name' => ['required', 'string', 'max:255'],
            'caretaker.lineage' => ['nullable', 'string', 'max:500'],
            'caretaker.bio_html' => ['required', 'string', 'max:20000'],
            'caretaker.works' => ['present', 'array', 'max:20'],
            'caretaker.works.*' => ['required', 'string', 'max:255'],
            'caretaker.organizations' => ['present', 'array', 'max:20'],
            'caretaker.organizations.*' => ['required', 'string', 'max:255'],
        ];
    }

    /** @return array<string, array<mixed>|string> */
    private function pondokRules(): array
    {
        return [
            'programs' => ['required', 'array', 'min:1', 'max:12'],
            'programs.*.title' => ['required', 'string', 'max:120'],
            'programs.*.description' => ['required', 'string', 'max:1000'],
            'programs.*.target' => ['required', 'string', 'max:500'],
            'activities' => ['present', 'array', 'max:12'],
            'activities.*.time' => ['required', 'string', 'max:80'],
            'activities.*.title' => ['required', 'string', 'max:160'],
            'activities.*.description' => ['required', 'string', 'max:500'],
            'facilities' => ['present', 'array', 'max:20'],
            'facilities.*' => ['required', 'string', 'max:160'],
            'quota_note' => ['required', 'string', 'max:1000'],
        ];
    }

    /** @return array<string, array<mixed>|string> */
    private function contactRules(): array
    {
        return [
            'address' => ['required', 'string', 'max:500'],
            'affiliation' => ['required', 'string', 'max:1000'],
            'contacts' => ['required', 'array', 'min:1', 'max:6'],
            'contacts.*.role' => ['required', 'string', 'max:80'],
            'contacts.*.phone' => ['required', 'string', 'regex:/^\+?[0-9 ()-]{8,20}$/'],
            'contacts.*.description' => ['required', 'string', 'max:500'],
            'social' => ['present', 'array', 'max:10'],
            'social.*.name' => ['required', 'string', 'max:40'],
            'social.*.handle' => ['required', 'string', 'max:120'],
            'social.*.href' => ['required', 'url:http,https', 'max:500'],
            'magazine_url' => ['nullable', 'url:http,https', 'max:500'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'contacts.*.phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, tanda hubung, atau tanda kurung (8-20 karakter).',
        ];
    }
}
