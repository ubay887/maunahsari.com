<?php

namespace Database\Seeders;

use App\Models\Province;
use App\Models\Regency;
use Illuminate\Database\Seeder;
use RuntimeException;

class AlumniRegionSeeder extends Seeder
{
    public function run(): void
    {
        $root = base_path('vendor/laravolt/indonesia/resources/csv/');
        foreach ($this->rows($root.'provinces.csv') as $row) {
            Province::updateOrCreate(['code' => $row[0]], ['name' => $row[1], 'latitude' => $this->coordinate($row[2] ?? '', -90, 90), 'longitude' => $this->coordinate($row[3] ?? '', -180, 180)]);
        }
        foreach ($this->rows($root.'cities.csv') as $row) {
            $province = Province::where('code', $row[1])->firstOrFail();
            Regency::updateOrCreate(['code' => $row[0]], ['province_id' => $province->id, 'name' => $row[2], 'type' => str_starts_with($row[2], 'KOTA ') ? 'kota' : 'kabupaten', 'latitude' => $this->coordinate($row[3] ?? '', -90, 90), 'longitude' => $this->coordinate($row[4] ?? '', -180, 180)]);
        }
    }

    /** @return \Generator<int, list<string>> */
    private function rows(string $path): \Generator
    {
        $file = fopen($path, 'r');
        if ($file === false) {
            throw new RuntimeException('Dataset wilayah tidak tersedia.');
        }
        try {
            while (($row = fgetcsv($file, escape: '')) !== false) {
                if (count($row) >= 4 && $row[0] !== null) {
                    yield array_map(fn (?string $value): string => $value ?? '', $row);
                }
            }
        } finally {
            fclose($file);
        }
    }

    private function coordinate(string $value, int $minimum, int $maximum): ?float
    {
        if (! is_numeric($value)) {
            return null;
        }
        $number = (float) $value;

        return $number >= $minimum && $number <= $maximum && $number !== 0.0 ? $number : null;
    }
}
