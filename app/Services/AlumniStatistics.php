<?php

namespace App\Services;

use App\Models\AlumniProfile;
use App\VerificationStatus;

class AlumniStatistics
{
    /** @return array<string, mixed> */
    public function get(): array
    {
        $total = AlumniProfile::count();
        $approved = AlumniProfile::where('verification_status', VerificationStatus::Approved)->count();
        $dimensions = [];
        foreach (['angkatan', 'province_id', 'program_id', 'activity_status', 'profession', 'map_mode', 'directory_visible'] as $field) {
            $relation = match ($field) {
                'province_id' => 'province', 'program_id' => 'program', default => null
            };
            $query = AlumniProfile::selectRaw($field.', COUNT(*) AS total')->groupBy($field);
            if ($relation) {
                $query->with($relation);
            }
            $dimensions[$field] = $query->get()->map(function (AlumniProfile $row) use ($field, $relation): array {
                $value = $row->getAttribute($field);
                $name = $relation ? $row->getRelation($relation)?->name : ($value instanceof \BackedEnum ? $value->value : $value);
                if ($field === 'directory_visible' && $value !== null) {
                    $name = $value ? 'diizinkan' : 'tidak diizinkan';
                }

                return ['name' => $name === null || $name === '' ? 'belum diisi/dipilih' : (string) $name, 'count' => (int) $row->getAttribute('total')];
            })->all();
        }
        $completeness = AlumniProfile::selectRaw("angkatan, COUNT(*) AS total, SUM(CASE WHEN phone_whatsapp IS NOT NULL AND profession IS NOT NULL AND bio IS NOT NULL AND skills IS NOT NULL AND skills <> '[]' THEN 1 ELSE 0 END) AS complete")->groupBy('angkatan')->orderBy('angkatan')->get()->map(fn (AlumniProfile $row): array => ['angkatan' => $row->angkatan, 'total' => (int) $row->getAttribute('total'), 'complete' => (int) $row->getAttribute('complete'), 'percentage' => round((int) $row->getAttribute('complete') * 100 / (int) $row->getAttribute('total'), 1)])->all();

        return ['total' => $total, 'approved' => $approved, 'pending' => AlumniProfile::where('verification_status', VerificationStatus::Pending)->count(), 'verified_percentage' => $total ? round($approved * 100 / $total, 1) : 0, 'dimensions' => $dimensions, 'completeness' => $completeness];
    }
}
