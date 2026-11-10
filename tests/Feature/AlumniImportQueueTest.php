<?php

namespace Tests\Feature;

use App\ImportStatus;
use App\Jobs\ProcessAlumniImport;
use App\Models\AlumniImportBatch;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Services\AlumniImport;
use App\Services\AlumniMapCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;
use Throwable;

class AlumniImportQueueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        AlumniProfile::factory()->make();
    }

    public function test_confirmation_queues_the_import_without_creating_profiles(): void
    {
        Queue::fake();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $this->previewToken($admin, ['Alya Alumni', 'Budi Alumni'])])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.alumni.import.index'))
            ->assertSessionHas('success');

        $batch = AlumniImportBatch::firstOrFail();
        Queue::assertPushed(ProcessAlumniImport::class, fn (ProcessAlumniImport $job): bool => $job->batchId === $batch->id);
        $this->assertSame(ImportStatus::Queued, $batch->status);
        $this->assertSame(2, $batch->total);
        $this->assertCount(2, $batch->payload ?? []);
        $this->assertDatabaseEmpty('alumni_profiles');
        $this->assertDatabaseMissing('audit_logs', ['action' => 'alumni.imported']);
    }

    public function test_job_creates_profiles_reports_duplicates_found_meanwhile_and_clears_the_payload(): void
    {
        Queue::fake();
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $this->previewToken($admin, ['Alya Alumni', 'Budi Alumni'])]);
        $batch = AlumniImportBatch::firstOrFail();
        AlumniProfile::factory()->create(['full_name' => 'Budi Alumni', 'angkatan' => '2010']);

        (new ProcessAlumniImport($batch->id))->handle(app(AlumniImport::class));

        $batch->refresh();
        $this->assertSame(ImportStatus::Completed, $batch->status);
        $this->assertSame(1, $batch->created_count);
        $this->assertSame(1, $batch->failed_count);
        $this->assertSame(3, $batch->errors[0]['row']);
        $this->assertNull($batch->payload);
        $imported = AlumniProfile::where('full_name', 'Alya Alumni')->firstOrFail();
        $this->assertSame('import', $imported->source);
        $this->assertNull($imported->user_id);
        $this->assertNull($imported->map_mode);
        $this->assertNull($imported->directory_visible);
        $this->assertDatabaseHas('audit_logs', ['action' => 'alumni.imported', 'actor_id' => $admin->id, 'subject_id' => $batch->id]);
    }

    public function test_job_invalidates_the_map_cache_once_the_import_is_done(): void
    {
        Queue::fake();
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $this->previewToken($admin, ['Alya Alumni'])]);
        $versionBefore = AlumniMapCache::version();

        (new ProcessAlumniImport(AlumniImportBatch::firstOrFail()->id))->handle(app(AlumniImport::class));

        $this->assertNotSame($versionBefore, AlumniMapCache::version());
    }

    public function test_processing_a_batch_that_is_no_longer_queued_creates_nothing(): void
    {
        Queue::fake();
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $this->previewToken($admin, ['Alya Alumni'])]);
        $batch = AlumniImportBatch::firstOrFail();
        $batch->update(['status' => ImportStatus::Completed]);

        (new ProcessAlumniImport($batch->id))->handle(app(AlumniImport::class));

        $this->assertDatabaseEmpty('alumni_profiles');
    }

    public function test_failed_job_rolls_back_every_profile_and_marks_the_batch_failed(): void
    {
        $batch = AlumniImportBatch::create([
            'file_name' => 'rusak.csv',
            'status' => ImportStatus::Queued,
            'total' => 2,
            'created_count' => 0,
            'failed_count' => 0,
            'errors' => [],
            'payload' => [
                ['row' => 2, 'data' => $this->validRowData('Alya Alumni'), 'errors' => []],
                ['row' => 3, 'data' => ['full_name' => null], 'errors' => []],
            ],
        ]);

        try {
            ProcessAlumniImport::dispatch($batch->id);
            $this->fail('The import should have thrown.');
        } catch (Throwable) {
            // The sync queue rethrows after calling failed(); the batch state is asserted below.
        }

        $batch->refresh();
        $this->assertSame(ImportStatus::Failed, $batch->status);
        $this->assertNull($batch->payload);
        $this->assertSame(0, $batch->errors[0]['row']);
        $this->assertDatabaseEmpty('alumni_profiles');
    }

    /**
     * Uploads a CSV through the real preview and returns the single-use confirmation token.
     *
     * @param  list<string>  $names
     */
    private function previewToken(User $admin, array $names): string
    {
        $csv = implode(',', AlumniImport::HEADERS)."\n";
        foreach ($names as $name) {
            $csv .= $name.",female,2010,2016,putri,lulus,2010,35,3571,bekerja,Guru,,,\n";
        }

        return app(AlumniImport::class)->preview(UploadedFile::fake()->createWithContent('alumni.csv', $csv), $admin)['token'];
    }

    /** @return array<string, mixed> */
    private function validRowData(string $name): array
    {
        $profile = AlumniProfile::factory()->make(['full_name' => $name]);

        return ['full_name' => $name, 'gender' => 'female', 'entry_year' => 2010, 'pondok' => 'putri', 'alumni_status' => 'lulus', 'angkatan' => '2010', 'province_id' => $profile->province_id, 'regency_id' => $profile->regency_id, 'activity_status' => 'bekerja'];
    }
}
