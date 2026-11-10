<?php

namespace Database\Factories;

use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Program> */
class ProgramFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['name' => fake()->unique()->words(2, true), 'slug' => fake()->unique()->slug(), 'description' => 'Pembelajaran Al-Quran bersama pengasuh.', 'requires_hafalan' => false, 'is_active' => true, 'sort_order' => 0];
    }
}
