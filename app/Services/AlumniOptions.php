<?php

namespace App\Services;

use App\Models\Program;
use App\Models\Province;
use App\Models\Regency;

class AlumniOptions
{
    /** @return array<string, mixed> */
    public function get(): array
    {
        return ['provinces' => Province::orderBy('name')->get(['id', 'name', 'code'])->toArray(), 'regencies' => Regency::orderBy('name')->get(['id', 'province_id', 'name', 'code'])->toArray(), 'programs' => Program::orderBy('sort_order')->get(['id', 'name'])->toArray(), 'privacyVersion' => config('alumni.privacy_version'), 'visibilityFields' => AlumniPrivacy::VISIBILITY_FIELDS];
    }
}
