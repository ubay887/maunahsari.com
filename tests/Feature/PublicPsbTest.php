<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\ProgramQuota;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicPsbTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function payload(ProgramQuota $quota): array
    {
        return [...Applicant::factory()->withRegionalAddress()->make(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id])->toArray(), 'birth_date' => '2013-02-10', 'email' => 'calon.santri@example.test', 'password' => 'password-calon-santri', 'password_confirmation' => 'password-calon-santri', 'documents' => ['ijazah' => UploadedFile::fake()->create('ijazah.pdf', 1, 'application/pdf'), 'kartu_keluarga' => UploadedFile::fake()->create('kk.pdf', 1, 'application/pdf'), 'pas_foto' => UploadedFile::fake()->image('foto.jpg')]];
    }

    public function test_online_submission_issues_receipt_and_receipt_is_session_protected(): void
    {
        Storage::fake('local');
        $quota = ProgramQuota::factory()->create();
        $this->get(route('psb.success'))->assertNotFound();
        $this->post(route('psb.store'), $this->payload($quota))->assertRedirect(route('psb.success'));
        $applicant = Applicant::firstOrFail();
        $this->get(route('psb.success'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('psb/success', false)->where('registration.registration_number', $applicant->registration_number)->missing('registration.guardian_phone'));
        $this->assertDatabaseCount('applicant_documents', 3);
    }

    /** @return array<string, array{string}> */
    public static function closedCases(): array
    {
        return ['full' => ['full'], 'manual' => ['manual'], 'period' => ['period'], 'future' => ['future'], 'expired' => ['expired']];
    }

    #[DataProvider('closedCases')]
    public function test_closed_form_and_submission_are_refused(string $case): void
    {
        $quota = ProgramQuota::factory()->create();
        if ($case === 'full') {
            $quota->update(['capacity' => 0]);
        }
        if ($case === 'manual') {
            $quota->update(['is_open' => false]);
        }
        if ($case === 'period') {
            $quota->registrationPeriod->update(['is_open' => false]);
        }
        if ($case === 'future') {
            $quota->registrationPeriod->update(['opens_at' => now()->addDay()]);
        }
        if ($case === 'expired') {
            $quota->registrationPeriod->update(['closes_at' => now()->subMinute()]);
        }
        $this->get(route('psb.register', ['program_id' => $quota->program_id, 'gender' => 'male']))->assertOk()->assertInertia(fn (Assert $page) => $page->component('psb/register', false)->where('closed', true)->where('closedMessage', 'Kuota habis, pendaftaran ditutup.'));
        $this->post(route('psb.store'), $this->payload($quota))->assertSessionHasErrors(['program_id' => 'Kuota habis, pendaftaran ditutup.']);
        $this->assertDatabaseCount('applicants', 0);
    }

    public function test_quota_can_fill_between_form_view_and_submit(): void
    {
        $quota = ProgramQuota::factory()->create(['capacity' => 1]);
        $this->get(route('psb.register'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('psb/register', false)->where('closed', false));
        Applicant::factory()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $this->post(route('psb.store'), $this->payload($quota))->assertSessionHasErrors('program_id');
        $this->assertDatabaseCount('applicants', 1);
    }

    public function test_file_limits_formats_required_fields_and_honeypot(): void
    {
        $quota = ProgramQuota::factory()->create();
        $payload = $this->payload($quota);
        $payload['documents']['ijazah'] = UploadedFile::fake()->create('large.pdf', 2049, 'application/pdf');
        $payload['documents']['kartu_keluarga'] = UploadedFile::fake()->create('wrong.txt', 1, 'text/plain');
        $payload['documents']['pas_foto'] = UploadedFile::fake()->create('not-image.jpg', 1, 'text/plain');
        $this->post(route('psb.store'), $payload)->assertSessionHasErrors(['documents.ijazah', 'documents.kartu_keluarga', 'documents.pas_foto']);
        $this->post(route('psb.store'), [])->assertSessionHasErrors(['full_name', 'guardian_phone', 'agreed_to_rules', 'program_id']);
        $this->post(route('psb.store'), [...$this->payload($quota), 'website' => 'spam'])->assertSessionHasErrors('website');
        $this->assertDatabaseCount('applicants', 0);
    }

    public function test_status_requires_matching_registration_and_guardian_phone_and_exposes_no_biodata(): void
    {
        $applicant = Applicant::factory()->create(['status' => 'rejected', 'decision_reason' => 'Berkas tidak sesuai.', 'visit_scheduled_at' => '2027-01-02 02:00:00']);
        $this->post(route('psb.status.store'), ['registration_number' => $applicant->registration_number, 'guardian_phone' => '081234567899'])->assertSessionHasErrors('registration_number');
        $this->post(route('psb.status.store'), ['registration_number' => $applicant->registration_number])->assertSessionHasErrors('guardian_phone');
        $this->post(route('psb.status.store'), ['registration_number' => $applicant->registration_number, 'guardian_phone' => '081234567890'])->assertRedirect();
        $this->get(route('psb.status.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('psb/status', false)->where('result.status', 'rejected')->where('result.decision_reason', 'Berkas tidak sesuai.')->missing('result.full_name')->missing('result.guardian_phone')->missing('result.documents'));
    }

    public function test_status_and_submission_are_rate_limited(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->post(route('psb.status.store'), [])->assertSessionHasErrors();
        }
        $this->post(route('psb.status.store'), [])->assertTooManyRequests();
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('psb.store'), [])->assertSessionHasErrors();
        }
        $this->post(route('psb.store'), [])->assertTooManyRequests();
    }

    public function test_array_inputs_fail_validation_without_server_errors(): void
    {
        $this->postJson(route('psb.store'), ['guardian_phone' => ['unexpected'], 'program_id' => [1]])->assertUnprocessable()->assertJsonValidationErrors(['guardian_phone', 'program_id']);
        $this->postJson(route('psb.status.store'), ['guardian_phone' => ['unexpected'], 'registration_number' => ['unexpected']])->assertUnprocessable()->assertJsonValidationErrors(['guardian_phone', 'registration_number']);
        $this->assertDatabaseCount('applicants', 0);
    }
}
