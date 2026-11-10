<?php

namespace Tests\Feature;

use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;
use App\Models\ApplicantDocument;
use App\Models\ApplicantPayment;
use App\Models\ProgramQuota;
use App\Models\User;
use App\UserRole;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ApplicantPortalTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function registrationPayload(ProgramQuota $quota, array $overrides = []): array
    {
        return [
            ...Applicant::factory()->withRegionalAddress()->make(['registration_period_id' => $quota->registration_period_id, 'program_id' => $quota->program_id])->toArray(),
            'birth_date' => '2013-02-10',
            'email' => 'calon.santri@example.test',
            'password' => 'password-calon-santri',
            'password_confirmation' => 'password-calon-santri',
            'documents' => ['ijazah' => UploadedFile::fake()->create('ijazah.pdf', 1, 'application/pdf'), 'kartu_keluarga' => UploadedFile::fake()->create('kk.pdf', 1, 'application/pdf'), 'pas_foto' => UploadedFile::fake()->image('foto.jpg')],
            ...$overrides,
        ];
    }

    /** @return array{0: User, 1: Applicant} */
    private function applicantWithAccount(ApplicantStatus $status = ApplicantStatus::Registered): array
    {
        $user = User::factory()->applicant()->create();
        $applicant = Applicant::factory()->withRegionalAddress()->create(['user_id' => $user->id, 'status' => $status]);

        return [$user, $applicant];
    }

    /** @return array<string, mixed> */
    private function profilePayload(Applicant $applicant, array $overrides = []): array
    {
        return [
            ...$applicant->only(['full_name', 'nik', 'birth_place', 'address', 'province_code', 'city_code', 'district_code', 'village_code', 'rt', 'rw', 'postal_code', 'last_education', 'can_read_binnadhor', 'can_write_pegon', 'guardian_name', 'guardian_relation', 'guardian_phone']),
            'birth_date' => '2013-02-10',
            ...$overrides,
        ];
    }

    public function test_online_registration_creates_a_verified_login_ready_applicant_account(): void
    {
        Storage::fake('local');
        Notification::fake();
        $quota = ProgramQuota::factory()->create();

        $this->post(route('psb.store'), $this->registrationPayload($quota))->assertRedirect(route('psb.success'));

        $applicant = Applicant::firstOrFail();
        $user = User::where('email', 'calon.santri@example.test')->firstOrFail();
        $this->assertSame($user->id, $applicant->user_id);
        $this->assertSame(UserRole::Applicant, $user->role);
        $this->assertNull($user->email_verified_at);
        $this->assertAuthenticatedAs($user);
        Notification::assertSentTo($user, VerifyEmail::class);
        $this->get(route('psb.success'))->assertInertia(fn (Assert $page) => $page->where('accountEmail', 'calon.santri@example.test'));
    }

    public function test_registration_ignores_an_injected_role_and_normalizes_the_email(): void
    {
        Storage::fake('local');
        $quota = ProgramQuota::factory()->create();

        $this->post(route('psb.store'), $this->registrationPayload($quota, ['role' => 'admin', 'email' => '  Calon.Santri@Example.TEST ']))->assertRedirect(route('psb.success'));

        $user = User::firstOrFail();
        $this->assertSame(UserRole::Applicant, $user->role);
        $this->assertSame('calon.santri@example.test', $user->email);
    }

    public function test_registration_with_an_email_already_in_use_is_refused_without_creating_an_applicant(): void
    {
        Storage::fake('local');
        User::factory()->create(['email' => 'calon.santri@example.test']);
        $quota = ProgramQuota::factory()->create();

        $this->post(route('psb.store'), $this->registrationPayload($quota))->assertSessionHasErrors(['email' => 'Email ini sudah terdaftar. Masuk dengan akun tersebut atau gunakan email lain.']);

        $this->assertDatabaseCount('applicants', 0);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_registration_requires_credentials_and_a_matching_password_confirmation(): void
    {
        $quota = ProgramQuota::factory()->create();

        $this->post(route('psb.store'), $this->registrationPayload($quota, ['email' => '', 'password' => '']))->assertSessionHasErrors(['email', 'password']);
        $this->post(route('psb.store'), $this->registrationPayload($quota, ['password_confirmation' => 'berbeda']))->assertSessionHasErrors('password');
        $this->assertDatabaseCount('applicants', 0);
    }

    public function test_applicant_login_lands_on_the_portal(): void
    {
        $user = User::factory()->applicant()->create();

        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])->assertRedirect(route('psb.portal.home'));
    }

    /** @return array<string, array{string}> */
    public static function portalPages(): array
    {
        return ['home' => ['psb.portal.home'], 'receipt' => ['psb.portal.receipt'], 'profile' => ['psb.portal.profile.edit'], 'documents' => ['psb.portal.documents.index'], 'payments' => ['psb.portal.payments.index']];
    }

    #[DataProvider('portalPages')]
    public function test_guests_are_sent_to_login_and_unverified_accounts_to_email_verification(string $route): void
    {
        $this->get(route($route))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->applicant()->unverified()->create())->get(route($route))->assertRedirect(route('verification.notice'));
    }

    #[DataProvider('portalPages')]
    public function test_alumni_are_refused_and_admins_are_sent_to_the_psb_administration(string $route): void
    {
        $this->actingAs(User::factory()->create())->get(route($route))->assertForbidden();

        $this->actingAs(User::factory()->admin()->create())->get(route($route))->assertRedirect(route('admin.psb.dashboard'));
    }

    public function test_admins_and_alumni_cannot_write_through_the_portal(): void
    {
        $this->actingAs(User::factory()->admin()->create())->put(route('psb.portal.profile.update'), [])->assertForbidden();
        $this->actingAs(User::factory()->create())->post(route('psb.portal.documents.store'), [])->assertForbidden();
    }

    public function test_applicants_cannot_enter_alumni_or_admin_areas(): void
    {
        $this->actingAs(User::factory()->applicant()->create());

        $this->get(route('alumni.home'))->assertForbidden();
        $this->get(route('admin.psb.dashboard'))->assertForbidden();
        $this->get(route('dashboard'))->assertForbidden();
    }

    public function test_policy_allows_only_the_owner_and_locks_updates_after_processing(): void
    {
        [$owner, $applicant] = $this->applicantWithAccount();
        $stranger = User::factory()->applicant()->create();

        $this->assertTrue($owner->can('viewOwn', $applicant));
        $this->assertTrue($owner->can('updateOwn', $applicant));
        $this->assertFalse($stranger->can('viewOwn', $applicant));
        $this->assertFalse(User::factory()->admin()->create()->can('viewOwn', $applicant));
        $applicant->update(['status' => ApplicantStatus::Verified]);
        $this->assertTrue($owner->can('viewOwn', $applicant->refresh()));
        $this->assertFalse($owner->can('updateOwn', $applicant));
    }

    public function test_home_shows_only_the_owners_registration_and_hides_internal_fields(): void
    {
        [$user, $applicant] = $this->applicantWithAccount(ApplicantStatus::Rejected);
        $applicant->update(['admin_note' => 'catatan internal', 'decision_reason' => 'Kuota penuh']);
        Applicant::factory()->create(['full_name' => 'Pendaftar Lain']);

        $this->actingAs($user)->get(route('psb.portal.home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('psb/portal/home', false)
            ->where('applicant.registration_number', $applicant->registration_number)
            ->where('applicant.decision_reason', 'Kuota penuh')
            ->where('applicant.can_edit', false)
            ->missing('applicant.admin_note')
            ->missing('applicant.nik')
            ->missing('applicant.guardian_phone')
            ->has('documents', 3));
    }

    public function test_home_handles_an_account_whose_registration_no_longer_exists(): void
    {
        [$user, $applicant] = $this->applicantWithAccount();
        $applicant->delete();

        $this->actingAs($user)->get(route('psb.portal.home'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('applicant', null));
        $this->actingAs($user)->get(route('psb.portal.profile.edit'))->assertNotFound();
        $this->actingAs($user)->get(route('psb.portal.receipt'))->assertNotFound();
    }

    public function test_owner_updates_biodata_but_cannot_change_program_gender_or_ownership(): void
    {
        [$user, $applicant] = $this->applicantWithAccount();
        $other = User::factory()->applicant()->create();
        $otherProgram = ProgramQuota::factory()->create();

        $this->actingAs($user)->put(route('psb.portal.profile.update'), $this->profilePayload($applicant, [
            'full_name' => 'Nama Baru',
            'program_id' => $otherProgram->program_id,
            'gender' => 'female',
            'user_id' => $other->id,
            'registration_period_id' => $otherProgram->registration_period_id,
        ]))->assertSessionHasNoErrors()->assertRedirect(route('psb.portal.home'));

        $fresh = $applicant->refresh();
        $this->assertSame('Nama Baru', $fresh->full_name);
        $this->assertSame($user->id, $fresh->user_id);
        $this->assertSame('male', $fresh->gender);
        $this->assertNotSame($otherProgram->program_id, $fresh->program_id);
    }

    public function test_biodata_update_fails_validation_with_indonesian_messages(): void
    {
        [$user, $applicant] = $this->applicantWithAccount();

        $this->actingAs($user)->put(route('psb.portal.profile.update'), $this->profilePayload($applicant, ['nik' => '123', 'guardian_phone' => 'abc']))
            ->assertSessionHasErrors(['nik' => 'NIK harus terdiri dari tepat 16 digit angka.', 'guardian_phone' => 'Gunakan nomor WhatsApp Indonesia yang valid.']);
        $this->assertNotSame('123', $applicant->refresh()->nik);
    }

    #[DataProvider('lockedStatuses')]
    public function test_biodata_and_documents_are_locked_once_registration_is_processed(ApplicantStatus $status): void
    {
        Storage::fake('local');
        [$user, $applicant] = $this->applicantWithAccount($status);

        $this->actingAs($user)->put(route('psb.portal.profile.update'), $this->profilePayload($applicant, ['full_name' => 'Nama Baru']))
            ->assertSessionHasErrors('status');
        $this->actingAs($user)->post(route('psb.portal.documents.store'), ['type' => DocumentType::Ijazah->value, 'document' => UploadedFile::fake()->create('ijazah.pdf', 1, 'application/pdf')])
            ->assertSessionHasErrors('document');

        $this->assertNotSame('Nama Baru', $applicant->refresh()->full_name);
        $this->assertDatabaseCount('applicant_documents', 0);
        Storage::disk('local')->assertDirectoryEmpty('psb/'.$applicant->id);
    }

    /** @return array<string, array{ApplicantStatus}> */
    public static function lockedStatuses(): array
    {
        return ['verified' => [ApplicantStatus::Verified], 'accepted' => [ApplicantStatus::Accepted], 'rejected' => [ApplicantStatus::Rejected]];
    }

    public function test_replacing_a_document_removes_the_old_file_and_requires_verification_again(): void
    {
        Storage::fake('local');
        [$user, $applicant] = $this->applicantWithAccount();
        Storage::disk('local')->put('psb/old.pdf', 'lama');
        ApplicantDocument::factory()->create(['applicant_id' => $applicant->id, 'type' => DocumentType::Ijazah, 'path' => 'psb/old.pdf', 'is_verified' => true, 'verified_at' => now()]);

        $this->actingAs($user)->post(route('psb.portal.documents.store'), ['type' => DocumentType::Ijazah->value, 'document' => UploadedFile::fake()->create('ijazah-baru.pdf', 10, 'application/pdf')])->assertSessionHasNoErrors();

        $document = $applicant->documents()->firstOrFail();
        $this->assertFalse($document->is_verified);
        $this->assertSame('ijazah-baru.pdf', $document->original_name);
        Storage::disk('local')->assertMissing('psb/old.pdf');
        Storage::disk('local')->assertExists($document->path);
    }

    public function test_document_upload_validates_type_and_format(): void
    {
        Storage::fake('local');
        [$user] = $this->applicantWithAccount();

        $this->actingAs($user)->post(route('psb.portal.documents.store'), ['type' => 'rahasia', 'document' => UploadedFile::fake()->create('a.pdf', 1, 'application/pdf')])->assertSessionHasErrors('type');
        $this->actingAs($user)->post(route('psb.portal.documents.store'), ['type' => DocumentType::PasFoto->value, 'document' => UploadedFile::fake()->create('foto.pdf', 1, 'application/pdf')])->assertSessionHasErrors('document');
        $this->actingAs($user)->post(route('psb.portal.documents.store'), ['type' => DocumentType::Ijazah->value, 'document' => UploadedFile::fake()->create('besar.pdf', 4096, 'application/pdf')])->assertSessionHasErrors('document');
    }

    public function test_owner_downloads_their_document_and_other_applicants_get_not_found(): void
    {
        Storage::fake('local');
        [$owner, $applicant] = $this->applicantWithAccount();
        [$stranger] = $this->applicantWithAccount();
        Storage::disk('local')->put('psb/ijazah.pdf', 'isi-berkas');
        $document = ApplicantDocument::factory()->create(['applicant_id' => $applicant->id, 'path' => 'psb/ijazah.pdf']);

        $this->actingAs($owner)->get(route('psb.portal.documents.show', $document))->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->actingAs($stranger)->get(route('psb.portal.documents.show', $document))->assertNotFound();
        $this->actingAs(User::factory()->create())->get(route('psb.portal.documents.show', $document))->assertForbidden();
    }

    public function test_receipt_shows_the_registration_summary(): void
    {
        [$user, $applicant] = $this->applicantWithAccount();

        $this->actingAs($user)->get(route('psb.portal.receipt'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('psb/portal/receipt', false)
            ->where('applicant.registration_number', $applicant->registration_number)
            ->where('applicant.pondok', 'Putra'));
    }

    public function test_payments_page_lists_only_the_owners_records_newest_first_with_total_and_without_the_recorder(): void
    {
        [$user, $applicant] = $this->applicantWithAccount();
        [, $stranger] = $this->applicantWithAccount();
        ApplicantPayment::factory()->create(['applicant_id' => $applicant->id, 'amount' => 100000, 'paid_at' => now()->subDays(2), 'note' => 'Uang pendaftaran']);
        $latest = ApplicantPayment::factory()->create(['applicant_id' => $applicant->id, 'amount' => 250000, 'paid_at' => now()->subDay()]);
        ApplicantPayment::factory()->create(['applicant_id' => $stranger->id, 'amount' => 999000]);

        $this->actingAs($user)->get(route('psb.portal.payments.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('psb/portal/payments', false)
            ->where('payments.total', 350000)
            ->has('payments.items', 2)
            ->where('payments.items.0.id', $latest->id)
            ->where('payments.items.1.note', 'Uang pendaftaran')
            ->missing('payments.items.0.recorded_by'));
    }

    public function test_payments_page_handles_no_records_and_exposes_the_fee_link_of_the_applicants_pondok(): void
    {
        [$user, $applicant] = $this->applicantWithAccount();
        $applicant->registrationPeriod->update(['fee_url_putra' => 'https://example.test/biaya-putra', 'fee_url_putri' => 'https://example.test/biaya-putri']);

        $this->actingAs($user)->get(route('psb.portal.payments.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('payments.total', 0)
            ->where('payments.items', [])
            ->where('applicant.fee_url', 'https://example.test/biaya-putra'));
    }

    public function test_admin_created_applicants_have_no_account_and_the_admin_form_ignores_credentials(): void
    {
        Storage::fake('local');
        $quota = ProgramQuota::factory()->create();

        $this->actingAs(User::factory()->admin()->create())->post(route('admin.psb.applicants.store'), [...$this->registrationPayload($quota), 'documents' => []])->assertSessionHasNoErrors();

        $this->assertNull(Applicant::firstOrFail()->user_id);
        $this->assertDatabaseMissing('users', ['email' => 'calon.santri@example.test']);
    }
}
