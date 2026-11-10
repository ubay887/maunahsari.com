<?php

namespace Database\Factories;

use App\Models\Applicant;
use App\Models\Program;
use App\Models\Santri;
use App\Pondok;
use App\ResidenceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Santri> */
class SantriFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['applicant_id' => Applicant::factory(), 'full_name' => 'Santri Contoh', 'gender' => 'male', 'pondok' => Pondok::Putra, 'residence_type' => ResidenceType::Mukim, 'program_id' => Program::factory(), 'birth_place' => 'Kediri', 'birth_date' => '2013-02-10', 'address' => 'Alamat contoh', 'guardian_name' => 'Wali Contoh', 'guardian_phone' => '6281234567890', 'entry_year' => 2026, 'is_active' => true];
    }
}
