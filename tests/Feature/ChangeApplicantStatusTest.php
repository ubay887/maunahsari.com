<?php

namespace Tests\Feature;

use App\Actions\Psb\ChangeApplicantStatus;
use App\Actions\Psb\SaveProgramQuota;
use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\ProgramQuota;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ChangeApplicantStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejection_releases_quota_and_reactivation_requires_free_space(): void
    {
        $quota = ProgramQuota::factory()->create(['capacity' => 1]);
        $applicant = Applicant::factory()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $admin = User::factory()->create();
        $action = app(ChangeApplicantStatus::class);
        $action->handle($applicant, ApplicantStatus::Rejected, $admin, 'Berkas tidak sesuai.');
        $this->assertSame(1, $quota->remaining());
        $action->handle($applicant, ApplicantStatus::Registered, $admin);
        $this->assertSame(0, $quota->remaining());
        $this->assertNull($applicant->fresh()->decision_reason);
        $action->handle($applicant, ApplicantStatus::Cancelled, $admin);
        Applicant::factory()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $this->expectException(ValidationException::class);
        $action->handle($applicant, ApplicantStatus::Registered, $admin);
    }

    public function test_rejection_requires_reason_and_invalid_transition_is_rejected(): void
    {
        $applicant = Applicant::factory()->create();
        $admin = User::factory()->create();
        foreach ([ApplicantStatus::Rejected, ApplicantStatus::Accepted] as $status) {
            try {
                app(ChangeApplicantStatus::class)->handle($applicant, $status, $admin);
                $this->fail('Transisi tidak sah diterima.');
            } catch (ValidationException $exception) {
                $this->assertNotEmpty($exception->errors());
            }
        }
        $this->assertSame(ApplicantStatus::Registered, $applicant->fresh()->status);
    }

    public function test_capacity_cannot_drop_below_used_seats(): void
    {
        $quota = ProgramQuota::factory()->create(['capacity' => 2]);
        Applicant::factory()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $this->expectException(ValidationException::class);
        app(SaveProgramQuota::class)->handle(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id, 'pondok' => 'putra', 'capacity' => 0, 'is_open' => true]);
    }
}
