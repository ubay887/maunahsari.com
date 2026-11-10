<?php

namespace Tests\Feature;

use App\ApplicantStatus;
use App\Models\Applicant;
use App\Models\Program;
use App\Models\ProgramQuota;
use App\Models\Santri;
use App\Pondok;
use Database\Seeders\PsbDemoSeeder;
use Database\Seeders\SantriSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PsbFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_quota_counts_only_occupying_applicants_in_the_same_program_period_and_pondok(): void
    {
        $quota = ProgramQuota::factory()->create(['capacity' => 4]);
        foreach (ApplicantStatus::cases() as $status) {
            Applicant::factory()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id, 'status' => $status]);
        }
        Applicant::factory()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id, 'pondok' => Pondok::Putri, 'gender' => 'female']);
        Applicant::factory()->create();
        $this->assertSame(3, $quota->usedCount());
        $this->assertSame(1, $quota->remaining());
        $this->assertTrue($quota->isAvailable());
        $quota->update(['is_open' => false]);
        $this->assertFalse($quota->isAvailable());
    }

    public function test_demo_seeder_is_repeatable_and_exposes_documented_quotas(): void
    {
        $this->seed(PsbDemoSeeder::class);
        $this->seed(PsbDemoSeeder::class);
        $this->assertDatabaseCount('programs', 4);
        $this->assertDatabaseCount('registration_periods', 4);
        $this->assertDatabaseCount('program_quotas', 32);
        $applicants = Applicant::count();
        $this->assertGreaterThan(90, $applicants);
        $this->seed(SantriSeeder::class);
        $santri = Santri::count();
        $this->assertSame(Applicant::where('status', 'accepted')->count(), $santri);
        $this->seed(PsbDemoSeeder::class);
        $this->seed(SantriSeeder::class);
        $this->assertSame($applicants, Applicant::count());
        $this->assertSame($santri, Santri::count());
        $riyadloh = Program::where('slug', 'riyadloh')->firstOrFail();
        $putra = ProgramQuota::where('program_id', $riyadloh->id)->where('pondok', Pondok::Putra)->firstOrFail();
        $putri = ProgramQuota::where('program_id', $riyadloh->id)->where('pondok', Pondok::Putri)->firstOrFail();
        $this->assertSame(5, $putra->capacity);
        $this->assertTrue($putra->is_open);
        $this->assertSame(25, $putri->capacity);
        $this->assertFalse($putri->is_open);
        $this->assertTrue($putra->registrationPeriod->isCurrentlyOpen());
    }
}
