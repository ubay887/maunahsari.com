<?php

namespace Database\Factories;

use App\Models\RegistrationPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<RegistrationPeriod> */
class RegistrationPeriodFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['name' => 'PSB 2026/2027', 'academic_year' => '2026/2027', 'is_open' => true, 'opens_at' => now()->subDay(), 'closes_at' => now()->addMonth(), 'contact_whatsapp_putra' => '6281234567890', 'contact_whatsapp_putri' => '6281234567891'];
    }
}
