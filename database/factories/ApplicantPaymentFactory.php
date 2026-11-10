<?php

namespace Database\Factories;

use App\Models\Applicant;
use App\Models\ApplicantPayment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ApplicantPayment> */
class ApplicantPaymentFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['applicant_id' => Applicant::factory(), 'amount' => 150000, 'paid_at' => now(), 'recorded_by' => User::factory()];
    }
}
