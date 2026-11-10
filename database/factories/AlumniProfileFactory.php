<?php

namespace Database\Factories;

use App\Models\AlumniProfile;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AlumniProfile> */
class AlumniProfileFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $province = Province::firstOrCreate(['code' => '35'], ['name' => 'JAWA TIMUR', 'latitude' => -7.5, 'longitude' => 112.5]);
        $regency = Regency::firstOrCreate(['code' => '3571'], ['province_id' => $province->id, 'name' => 'KOTA KEDIRI', 'type' => 'kota', 'latitude' => -7.82, 'longitude' => 112.01]);

        return ['user_id' => User::factory(), 'full_name' => fake()->name(), 'gender' => 'male', 'entry_year' => 2010, 'leave_year' => 2016, 'pondok' => 'putra', 'alumni_status' => 'lulus', 'angkatan' => '2010', 'province_id' => $province->id, 'regency_id' => $regency->id, 'activity_status' => 'bekerja', 'source' => 'self', 'verification_status' => 'pending', 'map_mode' => null, 'directory_visible' => null, 'field_visibility' => []];
    }

    public function approved(): static
    {
        return $this->state(fn (): array => ['verification_status' => 'approved', 'verified_at' => now(), 'map_mode' => 'visible', 'directory_visible' => true, 'field_visibility' => ['full_name' => 'alumni', 'angkatan' => 'alumni', 'regency' => 'alumni']]);
    }
}
