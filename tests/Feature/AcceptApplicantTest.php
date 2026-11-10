<?php

namespace Tests\Feature;

use App\Actions\Psb\AcceptApplicant;
use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;
use App\Models\ApplicantDocument;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AcceptApplicantTest extends TestCase
{
    use RefreshDatabase;

    public function test_acceptance_requires_every_document_verified(): void
    {
        $applicant = Applicant::factory()->create(['status' => ApplicantStatus::Verified]);
        ApplicantDocument::factory()->for($applicant)->create();
        $this->expectException(ValidationException::class);
        app(AcceptApplicant::class)->handle($applicant, User::factory()->create());
    }

    public function test_acceptance_copies_private_photo_and_is_idempotent(): void
    {
        Storage::fake('local');
        $applicant = Applicant::factory()->create(['status' => ApplicantStatus::Verified]);
        foreach (DocumentType::cases() as $type) {
            $path = 'psb/'.$type->value.'.'.($type === DocumentType::PasFoto ? 'jpg' : 'pdf');
            Storage::disk('local')->put($path, 'private file');
            ApplicantDocument::factory()->for($applicant)->create(['type' => $type, 'path' => $path, 'is_verified' => true]);
        }
        $admin = User::factory()->create();
        $action = app(AcceptApplicant::class);
        $action->handle($applicant, $admin);
        $action->handle($applicant, $admin);
        $this->assertDatabaseCount('santris', 1);
        $santri = Santri::firstOrFail();
        $this->assertSame($applicant->full_name, $santri->full_name);
        Storage::disk('local')->assertExists($santri->photo_path);
        $this->assertNotSame($applicant->documents()->where('type', DocumentType::PasFoto)->firstOrFail()->path, $santri->photo_path);
        $this->assertSame(ApplicantStatus::Accepted, $applicant->fresh()->status);
        $this->assertDatabaseCount('applicant_status_histories', 1);
    }
}
