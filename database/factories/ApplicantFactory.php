<?php

namespace Database\Factories;

use App\ApplicantSource;
use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\Program;
use App\Models\RegistrationPeriod;
use App\Pondok;
use App\ResidenceType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

/** @extends Factory<Applicant> */
class ApplicantFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['registration_number' => 'DEMO-'.strtoupper(fake()->unique()->uuid()), 'registration_period_id' => RegistrationPeriod::factory(), 'program_id' => Program::factory(), 'pondok' => Pondok::Putra, 'residence_type' => ResidenceType::Mukim, 'source' => ApplicantSource::Offline, 'status' => ApplicantStatus::Registered, 'full_name' => fake()->name(), 'nik' => fake()->numerify('35##############'), 'gender' => 'male', 'birth_place' => 'Kediri', 'birth_date' => '2013-02-10', 'address' => 'Alamat contoh Kediri', 'last_education' => 'SD/MI', 'can_read_binnadhor' => true, 'can_write_pegon' => false, 'guardian_name' => 'Wali Contoh', 'guardian_relation' => 'Ayah', 'guardian_phone' => '6281234567890', 'agreed_to_rules' => true, 'agreed_at' => now()];
    }

    public function withRegionalAddress(): static
    {
        return $this->state(function (): array {
            Province::firstOrCreate(['code' => '35'], ['name' => 'JAWA TIMUR']);
            City::firstOrCreate(['code' => '3571'], ['province_code' => '35', 'name' => 'KOTA KEDIRI']);
            District::firstOrCreate(['code' => '357101'], ['city_code' => '3571', 'name' => 'MOJOROTO']);
            Village::firstOrCreate(['code' => '3571011001'], ['district_code' => '357101', 'name' => 'BANDAR LOR']);

            return ['province_code' => '35', 'city_code' => '3571', 'district_code' => '357101', 'village_code' => '3571011001', 'rt' => '001', 'rw' => '002', 'postal_code' => '64114'];
        });
    }
}
