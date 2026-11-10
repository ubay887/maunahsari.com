<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\ProgramQuota;
use App\Models\RegistrationPeriod;
use App\Pondok;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProgramQuota> */
class ProgramQuotaFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['registration_period_id' => RegistrationPeriod::factory(), 'program_id' => Program::factory(), 'pondok' => Pondok::Putra, 'capacity' => 10, 'is_open' => true];
    }
}
