<?php

namespace Tests\Feature;

use App\Actions\Psb\SubmitApplication;
use App\ApplicantSource;
use App\Models\Applicant;
use App\Models\ProgramQuota;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class SubmitApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_submission_stores_private_documents_and_unique_numbers(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $quota = ProgramQuota::factory()->create();
        $data = Applicant::factory()->raw(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $action = app(SubmitApplication::class);
        $first = $action->handle($data, ['ijazah' => UploadedFile::fake()->create('ijazah.pdf', 10, 'application/pdf')], ApplicantSource::Online);
        $second = $action->handle($data, [], ApplicantSource::Offline);
        $this->assertNotSame($first->registration_number, $second->registration_number);
        $this->assertMatchesRegularExpression('/^PSB26-\d+-P-0001$/', $first->registration_number);
        Storage::disk('local')->assertExists($first->documents()->firstOrFail()->path);
        Storage::disk('public')->assertEmpty();
        $this->assertDatabaseHas('applicant_status_histories', ['applicant_id' => $first->id, 'to_status' => 'registered']);
    }

    public function test_second_submit_to_last_seat_is_rejected_even_with_stale_quota_model(): void
    {
        $quota = ProgramQuota::factory()->create(['capacity' => 1]);
        $data = Applicant::factory()->raw(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        app(SubmitApplication::class)->handle($data, [], ApplicantSource::Offline);
        try {
            app(SubmitApplication::class)->handle($data, [], ApplicantSource::Offline);
            $this->fail('Kuota harus menolak submit kedua.');
        } catch (ValidationException $exception) {
            $this->assertSame(['Kuota habis, pendaftaran ditutup.'], $exception->errors()['program_id']);
        }
        $this->assertDatabaseCount('applicants', 1);
    }

    public function test_failed_upload_rolls_back_applicant_sequence_and_removes_written_files(): void
    {
        Storage::fake('local');
        $quota = ProgramQuota::factory()->create();
        $data = Applicant::factory()->raw(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $broken = $this->mock(UploadedFile::class);
        $broken->shouldReceive('store')->once()->andReturn(false);
        try {
            app(SubmitApplication::class)->handle($data, ['ijazah' => UploadedFile::fake()->create('ijazah.pdf', 1, 'application/pdf'), 'kartu_keluarga' => $broken], ApplicantSource::Online);
            $this->fail('Upload gagal harus membatalkan pendaftaran.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('documents.kartu_keluarga', $exception->errors());
        }
        $this->assertDatabaseCount('applicants', 0);
        $this->assertDatabaseCount('registration_sequences', 0);
        Storage::disk('local')->assertEmpty();
    }
}
