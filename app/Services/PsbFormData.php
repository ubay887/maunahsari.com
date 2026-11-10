<?php

namespace App\Services;

use App\GuardianRelation;
use App\LastEducation;
use App\Models\Applicant;
use Illuminate\Database\Eloquent\Model;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class PsbFormData
{
    /** @return array<string, mixed> */
    public function options(?Applicant $applicant = null): array
    {
        return [
            'guardianRelations' => array_map(fn (GuardianRelation $relation): array => ['value' => $relation->value, 'label' => $relation->value], GuardianRelation::cases()),
            'educationLevels' => array_map(fn (LastEducation $education): array => ['value' => $education->value, 'label' => $education->value], LastEducation::cases()),
            'addressOptions' => [
                'provinces' => $this->regions('provinces'),
                'cities' => $applicant?->province_code ? $this->regions('cities', $applicant->province_code) : [],
                'districts' => $applicant?->city_code ? $this->regions('districts', $applicant->city_code) : [],
                'villages' => $applicant?->district_code ? $this->regions('villages', $applicant->district_code) : [],
            ],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    public function regions(string $level, ?string $parentCode = null): array
    {
        $query = match ($level) {
            'provinces' => Province::query(),
            'cities' => City::query()->where('province_code', $parentCode),
            'districts' => District::query()->where('city_code', $parentCode),
            'villages' => Village::query()->where('district_code', $parentCode),
            default => throw new \InvalidArgumentException('Jenis wilayah tidak valid.'),
        };

        return array_values($query->orderBy('name')->get(['code', 'name'])->map(fn (Model $region): array => [
            'value' => (string) $region->getAttribute('code'),
            'label' => (string) $region->getAttribute('name'),
        ])->all());
    }
}
