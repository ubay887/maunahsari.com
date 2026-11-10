<?php

namespace App\Services;

use App\Models\Regency;
use Illuminate\Support\Facades\Cache;

/**
 * Sebaran alumni per kota/kabupaten dengan jumlah nyata, berapa pun kecilnya.
 * Hanya jumlah yang keluar dari sini; identitas tetap lewat {@see AlumniPrivacy}.
 */
class AlumniMap
{
    public function __construct(private AlumniPrivacy $privacy, private AlumniQuery $query) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array{groups:list<array<string,mixed>>,by_angkatan:list<array{name:string,count:int,label:string}>,total:int}
     */
    public function get(array $filters): array
    {
        $filters = array_intersect_key($filters, array_flip(['angkatan', 'pondok', 'program_id', 'profession', 'activity_status']));
        ksort($filters);
        $key = 'alumni-map:'.AlumniMapCache::version().':'.hash('sha256', json_encode($filters, JSON_THROW_ON_ERROR));

        return Cache::remember($key, now()->addMinutes(10), fn (): array => $this->aggregate($filters));
    }

    /**
     * Daftar angkatan untuk dropdown filter. Sengaja tidak ikut terfilter agar angkatan lain tetap dapat dipilih.
     *
     * @return list<string>
     */
    public function angkatanOptions(): array
    {
        $options = Cache::remember('alumni-map-angkatan:'.AlumniMapCache::version(), now()->addMinutes(10), fn (): array => $this->privacy->mappable()->whereNotNull('angkatan')->distinct()->orderBy('angkatan')->pluck('angkatan')->map(fn ($value): string => (string) $value)->all());

        return array_values($options);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{groups:list<array<string,mixed>>,by_angkatan:list<array{name:string,count:int,label:string}>,total:int}
     */
    private function aggregate(array $filters): array
    {
        $base = $this->query->apply($this->privacy->mappable(), $filters);
        $rows = (clone $base)->selectRaw('regency_id, COUNT(*) AS total')->groupBy('regency_id')->get();
        $regencies = Regency::with('province')->whereIn('id', $rows->pluck('regency_id'))->get()->keyBy('id');
        $groups = [];
        $total = 0;
        foreach ($rows as $row) {
            $count = (int) $row->getAttribute('total');
            $total += $count;
            $region = $regencies->get($row->regency_id);
            if ($region === null || $region->latitude === null || $region->longitude === null) {
                continue;
            }
            $groups[] = ['level' => 'regency', 'id' => $region->id, 'name' => $region->name, 'province' => $region->province?->name, 'latitude' => $region->latitude, 'longitude' => $region->longitude, 'count' => $count, 'label' => (string) $count];
        }
        $byAngkatan = (clone $base)->selectRaw('angkatan, COUNT(*) AS total')->groupBy('angkatan')->orderBy('angkatan')->get()->map(fn ($row): array => ['name' => (string) $row->angkatan, 'count' => (int) $row->getAttribute('total'), 'label' => (string) $row->getAttribute('total')])->all();

        return ['groups' => $groups, 'by_angkatan' => array_values($byAngkatan), 'total' => $total];
    }
}
