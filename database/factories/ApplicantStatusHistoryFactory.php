<?php

namespace Database\Factories;

use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\ApplicantStatusHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ApplicantStatusHistory> */
class ApplicantStatusHistoryFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['applicant_id' => Applicant::factory(), 'from_status' => null, 'to_status' => ApplicantStatus::Registered];
    }
}
