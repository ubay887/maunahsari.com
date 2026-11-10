<?php

namespace Tests\Feature;

use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;
use App\Models\ProgramQuota;
use App\Models\Santri;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PsbLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lifecycle_accept_cancel_replace_photo_reactivate_and_accept_again(): void
    {
        Storage::fake('local');
        $quota = ProgramQuota::factory()->create(['capacity' => 1]);
        $applicant = Applicant::factory()->withRegionalAddress()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']));
        foreach (DocumentType::cases() as $type) {
            $file = $type === DocumentType::PasFoto ? UploadedFile::fake()->image('photo.jpg') : UploadedFile::fake()->create('document.pdf', 1, 'application/pdf');
            $this->post(route('admin.psb.applicants.documents.store', $applicant), ['type' => $type->value, 'document' => $file])->assertSessionHasNoErrors();
            $document = $applicant->documents()->where('type', $type)->firstOrFail();
            $this->patch(route('admin.psb.documents.verify', $document))->assertSessionHasNoErrors();
        }
        $this->patch(route('admin.psb.applicants.status', $applicant), ['status' => 'verified'])->assertSessionHasNoErrors();
        $this->patch(route('admin.psb.applicants.status', $applicant), ['status' => 'accepted'])->assertSessionHasNoErrors();
        $this->patch(route('admin.psb.applicants.status', $applicant), ['status' => 'accepted'])->assertSessionHasNoErrors();
        $santri = Santri::firstOrFail();
        $oldPhoto = $santri->photo_path;
        $this->assertSame($applicant->nik, $santri->nik);
        $this->assertSame('3571011001', $santri->village_code);
        $this->assertDatabaseCount('santris', 1);
        $this->get(route('admin.santri.photo', $santri))->assertOk();
        $this->post(route('admin.psb.applicants.documents.store', $applicant), ['type' => 'pas_foto', 'document' => UploadedFile::fake()->image('changed.jpg')])->assertSessionHasErrors('document');
        $this->patch(route('admin.psb.applicants.status', $applicant), ['status' => 'cancelled'])->assertSessionHasNoErrors();
        $this->assertFalse($santri->fresh()->is_active);
        $this->assertSame(1, $quota->remaining());
        $this->post(route('admin.psb.applicants.documents.store', $applicant), ['type' => 'pas_foto', 'document' => UploadedFile::fake()->image('changed.jpg')])->assertSessionHasNoErrors();
        $photo = $applicant->documents()->where('type', DocumentType::PasFoto)->firstOrFail();
        $this->assertFalse($photo->is_verified);
        $this->patch(route('admin.psb.documents.verify', $photo))->assertSessionHasNoErrors();
        foreach (['registered', 'verified', 'accepted'] as $status) {
            $this->patch(route('admin.psb.applicants.status', $applicant), ['status' => $status])->assertSessionHasNoErrors();
        }
        $this->assertSame(ApplicantStatus::Accepted, $applicant->fresh()->status);
        $this->assertDatabaseCount('santris', 1);
        $this->assertTrue($santri->fresh()->is_active);
        $this->assertNotSame($oldPhoto, $santri->fresh()->photo_path);
    }

    public function test_transfer_checks_target_quota_and_period_gender_are_immutable(): void
    {
        $quota = ProgramQuota::factory()->create(['capacity' => 1]);
        $target = ProgramQuota::factory()->create(['registration_period_id' => $quota->registration_period_id, 'capacity' => 0]);
        $applicant = Applicant::factory()->withRegionalAddress()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']));
        $data = [...$applicant->toArray(), 'birth_date' => '2013-02-10', 'program_id' => $target->program_id];
        $this->put(route('admin.psb.applicants.update', $applicant), $data)->assertSessionHasErrors('program_id');
        $this->assertSame($quota->program_id, $applicant->fresh()->program_id);
        $this->put(route('admin.psb.applicants.update', $applicant), [...$data, 'gender' => 'female'])->assertSessionHasErrors('registration_period_id');
        $target->update(['capacity' => 1]);
        $this->put(route('admin.psb.applicants.update', $applicant), $data)->assertSessionHasNoErrors();
        $this->assertSame(1, $quota->remaining());
        $this->assertSame(0, $target->remaining());
    }

    public function test_public_info_is_in_sitemap_and_admin_pages_have_real_components(): void
    {
        $quota = ProgramQuota::factory()->create();
        $this->get(route('psb.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('psb/index')->has('quotas', 1));
        $this->assertStringContainsString(route('psb.index'), $this->get(route('articles.sitemap'))->assertOk()->streamedContent());
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']));
        foreach (['admin.psb.dashboard' => 'admin/psb/dashboard', 'admin.psb.periods.index' => 'admin/psb/periods/index', 'admin.psb.programs.index' => 'admin/psb/programs/index', 'admin.psb.quotas.index' => 'admin/psb/quotas/index', 'admin.psb.applicants.create' => 'admin/psb/applicants/create', 'admin.santri.index' => 'admin/santri/index'] as $route => $component) {
            $this->get(route($route))->assertOk()->assertInertia(fn (Assert $page) => $page->component($component));
        }
    }

    public function test_wib_attendance_and_payments_are_validated_against_the_correct_instant(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-11-03 01:30:00', 'UTC'));
        $applicant = Applicant::factory()->withRegionalAddress()->create();
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']));
        $this->patch(route('admin.psb.applicants.visit', $applicant), ['visited_at' => '2026-11-03T08:20'])->assertSessionHasNoErrors();
        $this->assertSame('2026-11-03 01:20', $applicant->fresh()->visited_at->format('Y-m-d H:i'));
        $this->post(route('admin.psb.applicants.payments.store', $applicant), ['amount' => 100000, 'paid_at' => '2026-11-03T08:20'])->assertSessionHasNoErrors();
        $this->assertSame('2026-11-03 01:20', $applicant->payments()->firstOrFail()->paid_at->format('Y-m-d H:i'));
        $this->patch(route('admin.psb.applicants.visit', $applicant), ['visited_at' => '2026-11-03T08:31'])->assertSessionHasErrors('visited_at');
        $this->post(route('admin.psb.applicants.payments.store', $applicant), ['amount' => 100000, 'paid_at' => '2026-11-03T08:31'])->assertSessionHasErrors('paid_at');
        $this->assertDatabaseCount('applicant_payments', 1);
    }
}
