<?php

namespace App\Services;

use App\Models\AlumniProfile;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class AlumniRadar
{
    public function __construct(private AlumniPrivacy $privacy, private AlumniQuery $query) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, non-empty-array<string, mixed>>
     */
    public function search(User $user, Regency $center, int $radius, array $filters): LengthAwarePaginator
    {
        $distances = [];
        if ($center->latitude !== null && $center->longitude !== null) {
            foreach (Regency::whereNotNull('latitude')->whereNotNull('longitude')->get() as $region) {
                if ($region->latitude === null || $region->longitude === null) {
                    continue;
                }
                $distance = self::distance($center->latitude, $center->longitude, $region->latitude, $region->longitude);
                if ($distance <= $radius) {
                    $distances[$region->id] = $distance;
                }
            }
        }
        unset($filters['regency_id'], $filters['province_id']);

        return $this->query->apply($this->privacy->discoverable()->with(['province', 'regency', 'program']), $filters, true)->where('id', '!=', $user->alumniProfile?->id)->whereIn('regency_id', array_keys($distances))->orderBy('regency_id')->orderBy('id')->paginate(12)->withQueryString()->through(fn (AlumniProfile $profile): array => [...$this->privacy->profile($profile, $user), 'distance_band' => self::band($distances[$profile->regency_id])]);
    }

    public static function distance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $deltaLatitude = deg2rad($lat2 - $lat1);
        $deltaLongitude = deg2rad($lon2 - $lon1);
        $a = sin($deltaLatitude / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($deltaLongitude / 2) ** 2;

        return 6371.0088 * 2 * atan2(sqrt(max(0, min(1, $a))), sqrt(max(0, 1 - $a)));
    }

    public static function band(float $distance): string
    {
        return 'dalam '.($distance <= 25 ? 25 : ($distance <= 50 ? 50 : 100)).' km';
    }
}
