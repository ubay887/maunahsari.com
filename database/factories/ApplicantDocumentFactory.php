<?php

namespace Database\Factories;

use App\DocumentType;
use App\Models\Applicant;
use App\Models\ApplicantDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ApplicantDocument> */
class ApplicantDocumentFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['applicant_id' => Applicant::factory(), 'type' => DocumentType::Ijazah, 'path' => 'psb/demo.pdf', 'original_name' => 'ijazah.pdf', 'size' => 1200, 'mime' => 'application/pdf', 'is_verified' => false];
    }
}
