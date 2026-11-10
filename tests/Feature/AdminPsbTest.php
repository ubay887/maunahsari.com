<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\ApplicantDocument;
use App\Models\Program;
use App\Models\ProgramQuota;
use App\Models\RegistrationPeriod;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPsbTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create(['email' => 'admin@example.test']);
    }

    public function test_admin_routes_refuse_guests_non_admins_and_unverified_admins(): void
    {
        foreach (['admin.psb.dashboard', 'admin.psb.applicants.index', 'admin.psb.periods.index', 'admin.psb.programs.index', 'admin.psb.quotas.index', 'admin.santri.index'] as $route) {
            $this->get(route($route))->assertRedirect(route('login'));
        }
        $this->actingAs(User::factory()->create());
        foreach (['admin.psb.dashboard', 'admin.psb.applicants.index', 'admin.psb.periods.index', 'admin.psb.programs.index', 'admin.psb.quotas.index', 'admin.santri.index'] as $route) {
            $this->get(route($route))->assertForbidden();
        }
        $this->actingAs(User::factory()->admin()->unverified()->create(['email' => 'admin@example.test']))->get(route('admin.psb.applicants.index'))->assertRedirect(route('verification.notice'));
    }

    public function test_offline_registration_allows_missing_documents_and_ignores_sensitive_fields(): void
    {
        $quota = ProgramQuota::factory()->create();
        $data = Applicant::factory()->withRegionalAddress()->make(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id, 'status' => 'accepted', 'source' => 'online'])->toArray();
        $this->actingAs($this->admin())->post(route('admin.psb.applicants.store'), [...$data, 'birth_date' => '2013-02-10'])->assertSessionHasNoErrors()->assertRedirect();
        $applicant = Applicant::firstOrFail();
        $this->assertSame('registered', $applicant->status->value);
        $this->assertSame('offline', $applicant->source->value);
        $this->assertDatabaseCount('applicant_documents', 0);
    }

    public function test_documents_are_private_and_admin_can_stream_download_replace_and_verify(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $applicant = Applicant::factory()->create();
        $document = ApplicantDocument::factory()->for($applicant)->create(['path' => 'psb/private.pdf']);
        Storage::disk('local')->put($document->path, 'sensitive');
        $this->get(route('admin.psb.documents.show', $document))->assertRedirect(route('login'));
        $this->get('/storage/'.$document->path)->assertNotFound();
        $this->actingAs(User::factory()->create())->get(route('admin.psb.documents.show', $document))->assertForbidden();
        $this->actingAs($this->admin())->get(route('admin.psb.documents.show', $document))->assertOk()->assertStreamedContent('sensitive');
        $this->get(route('admin.psb.documents.show', [$document, 'download' => 1]))->assertDownload('ijazah.pdf');
        $this->post(route('admin.psb.applicants.documents.store', $applicant), ['type' => 'ijazah', 'document' => UploadedFile::fake()->create('new.pdf', 1, 'application/pdf')])->assertRedirect();
        $document->refresh();
        $this->assertFalse($document->is_verified);
        $this->patch(route('admin.psb.documents.verify', $document))->assertRedirect();
        $this->assertTrue($document->fresh()->is_verified);
        Storage::disk('public')->assertEmpty();
    }

    public function test_filtered_csv_and_index_have_the_same_results_and_csv_neutralizes_formulas(): void
    {
        $match = Applicant::factory()->create(['full_name' => '=SUM(1,2)', 'guardian_phone' => '6281234567890']);
        Applicant::factory()->create(['pondok' => 'putri', 'gender' => 'female']);
        $filters = ['pondok' => 'putra', 'registration_period_id' => $match->registration_period_id, 'search' => '081234567890', 'sort' => 'full_name', 'direction' => 'asc'];
        $this->actingAs($this->admin())->get(route('admin.psb.applicants.index', $filters))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/psb/applicants/index', false)->where('applicants.total', 1));
        $csv = $this->get(route('admin.psb.applicants.export', $filters))->assertOk()->streamedContent();
        $this->assertStringContainsString($match->registration_number, $csv);
        $this->assertStringContainsString("'=SUM", $csv);
        $this->get(route('admin.psb.applicants.index', ['sort' => 'password']))->assertSessionHasErrors('sort');
    }

    public function test_admin_cannot_reduce_capacity_below_usage(): void
    {
        $quota = ProgramQuota::factory()->create(['capacity' => 2]);
        Applicant::factory()->create(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id]);
        $this->actingAs($this->admin())->post(route('admin.psb.quotas.store'), ['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id, 'pondok' => 'putra', 'capacity' => 0, 'is_open' => true])->assertSessionHasErrors('capacity');
        $this->assertSame(2, $quota->fresh()->capacity);
    }

    public function test_sowan_and_manual_payment_and_soft_delete(): void
    {
        $applicant = Applicant::factory()->create();
        $this->actingAs($this->admin());
        $this->patch(route('admin.psb.applicants.visit', $applicant), ['visit_scheduled_at' => '2027-02-01T08:00', 'admin_note' => 'Bersama wali.'])->assertRedirect();
        $this->assertSame('2027-02-01 01:00', $applicant->fresh()->visit_scheduled_at->format('Y-m-d H:i'));
        $this->post(route('admin.psb.applicants.payments.store', $applicant), ['amount' => 125000, 'paid_at' => '2026-01-01T09:00'])->assertRedirect();
        $payment = $applicant->payments()->firstOrFail();
        $this->assertSame(125000, $payment->amount);
        $other = Applicant::factory()->create();
        $this->delete(route('admin.psb.applicants.payments.destroy', [$other, $payment]))->assertNotFound();
        $this->delete(route('admin.psb.applicants.payments.destroy', [$applicant, $payment]))->assertRedirect();
        $this->assertModelMissing($payment);
        $this->delete(route('admin.psb.applicants.destroy', $applicant))->assertRedirect();
        $this->assertSoftDeleted($applicant);
    }

    public function test_admin_can_manage_period_program_and_read_santri(): void
    {
        $this->actingAs($this->admin());
        $this->post(route('admin.psb.periods.store'), ['name' => 'PSB Baru', 'academic_year' => '2027/2028', 'opens_at' => '2027-01-01T00:00', 'is_open' => true, 'contact_whatsapp_putra' => '081234567890', 'fee_url_putra' => 'https://drive.google.com/file/d/example/view'])->assertRedirect();
        $period = RegistrationPeriod::firstOrFail();
        $this->assertSame('6281234567890', $period->contact_whatsapp_putra);
        $this->put(route('admin.psb.periods.update', $period), [...$period->toArray(), 'is_open' => false])->assertRedirect();
        $this->assertFalse($period->fresh()->is_open);
        $programData = ['name' => 'Program Baru', 'slug' => 'program-baru', 'description' => 'Pembelajaran.', 'is_active' => true, 'requires_hafalan' => false, 'sort_order' => 1];
        $this->post(route('admin.psb.programs.store'), $programData)->assertRedirect();
        $program = Program::firstOrFail();
        $this->put(route('admin.psb.programs.update', $program), [...$programData, 'is_active' => false])->assertRedirect();
        $this->assertFalse($program->fresh()->is_active);
        $santri = Santri::factory()->create();
        $this->get(route('admin.santri.show', $santri))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/santri/show', false)->where('santri.id', $santri->id));
    }
}
