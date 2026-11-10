<?php

namespace Tests\Feature;

use App\ContactRequestStatus;
use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\ConsentRecord;
use App\Models\ContactRequest;
use App\Models\User;
use App\Services\AlumniPrivacy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AlumniPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    /** @return array<string, mixed> */
    private function data(): array
    {
        $profile = AlumniProfile::factory()->make();

        return [...array_intersect_key($profile->toArray(), array_flip(AlumniPrivacy::EDITABLE)), 'map_mode' => 'visible', 'directory_visible' => true, 'field_visibility' => ['full_name' => 'alumni'], 'privacy_consent' => true, 'privacy_version' => config('alumni.privacy_version')];
    }

    public function test_verified_alumni_can_submit_profile_with_explicit_consent_and_cannot_inject_approval(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('alumni.profile.update'), [...$this->data(), 'verification_status' => 'approved', 'source' => 'admin', 'photo' => UploadedFile::fake()->image('photo.png')])->assertSessionHasNoErrors()->assertRedirect(route('alumni.home'));
        $profile = $user->alumniProfile()->firstOrFail();
        $this->assertSame('pending', $profile->verification_status->value);
        $this->assertSame('self', $profile->source);
        $this->assertDatabaseCount('consent_records', 3);
        Storage::disk('local')->assertExists($profile->photo_path);
    }

    public function test_home_without_a_profile_exposes_no_profile_data(): void
    {
        $this->actingAs(User::factory()->create())->get(route('alumni.home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('alumni/home')
            ->where('profile', null)
            ->where('completeness', null)
            ->where('stats', null));
    }

    public function test_home_reports_profile_completeness_and_only_live_pending_requests_for_approved_alumni(): void
    {
        $user = User::factory()->create();
        $profile = AlumniProfile::factory()->approved()->create(['user_id' => $user->id, 'profession' => null, 'bio' => null]);
        $requesters = AlumniProfile::factory()->approved()->count(3)->create();
        $request = ['target_profile_id' => $profile->id, 'message' => 'Halo', 'status' => ContactRequestStatus::Pending];
        ContactRequest::create([...$request, 'requester_profile_id' => $requesters[0]->id, 'expires_at' => now()->addDay()]);
        ContactRequest::create([...$request, 'requester_profile_id' => $requesters[1]->id, 'expires_at' => now()->subDay()]);
        ContactRequest::create([...$request, 'requester_profile_id' => $requesters[2]->id, 'status' => ContactRequestStatus::Declined, 'expires_at' => now()->addDay()]);

        $this->actingAs($user)->get(route('alumni.home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('profile.full_name', $profile->full_name)
            ->where('completeness.percent', 55)
            ->has('completeness.missing', 5)
            ->where('stats.pendingRequests', 1)
            ->where('stats.alumniTotal', 4));
    }

    public function test_home_hides_browse_stats_until_the_profile_is_approved_with_privacy_chosen(): void
    {
        $user = User::factory()->create();
        AlumniProfile::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get(route('alumni.home'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('needsPrivacy', true)
            ->where('stats', null));
    }

    public function test_privacy_choices_and_current_policy_consent_are_required(): void
    {
        $user = User::factory()->create();
        $data = $this->data();
        $this->actingAs($user)->post(route('alumni.profile.update'), [...$data, 'map_mode' => null, 'directory_visible' => null, 'privacy_consent' => false, 'privacy_version' => 'old'])->assertSessionHasErrors(['map_mode', 'directory_visible', 'privacy_consent', 'privacy_version']);
        $this->assertDatabaseEmpty('alumni_profiles');
    }

    public function test_privacy_withdrawal_preserves_verification_and_records_history(): void
    {
        $profile = AlumniProfile::factory()->approved()->create();
        $this->actingAs($profile->user)->put(route('alumni.privacy.update'), ['map_mode' => 'hidden', 'directory_visible' => false, 'field_visibility' => ['full_name' => 'private'], 'privacy_consent' => true, 'privacy_version' => config('alumni.privacy_version')])->assertSessionHasNoErrors();
        $this->assertSame('approved', $profile->fresh()->verification_status->value);
        $this->assertDatabaseHas('consent_records', ['type' => 'map_display', 'granted' => false]);
        $this->assertDatabaseHas('consent_records', ['type' => 'directory_display', 'granted' => false]);
    }

    public function test_claim_is_hashed_single_use_and_resets_privacy(): void
    {
        $code = str_repeat('a', 40);
        $import = AlumniProfile::factory()->create(['user_id' => null, 'source' => 'import', 'claim_code_hash' => hash('sha256', $code)]);
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('alumni.claim.store'), ['code' => $code])->assertSessionHasNoErrors()->assertRedirect(route('alumni.privacy.edit'));
        $this->assertSame($user->id, $import->fresh()->user_id);
        $this->assertNull($import->fresh()->claim_code_hash);
        $this->assertNull($import->fresh()->map_mode);
        $this->assertNull($import->fresh()->directory_visible);
        $this->assertSame('import', $import->fresh()->source);
        $this->actingAs(User::factory()->create())->post(route('alumni.claim.store'), ['code' => $code])->assertSessionHasErrors('code');
    }

    public function test_wrong_claim_is_rejected_and_throttled(): void
    {
        $this->actingAs(User::factory()->create());
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('alumni.claim.store'), ['code' => str_repeat('z', 40)])->assertSessionHasErrors('code');
        }
        $this->post(route('alumni.claim.store'), ['code' => str_repeat('z', 40)])->assertTooManyRequests();
    }

    public function test_contact_is_only_revealed_to_requester_after_owner_approval_and_audited(): void
    {
        $requester = AlumniProfile::factory()->approved()->create();
        $target = AlumniProfile::factory()->approved()->create(['phone_whatsapp' => '628123456789']);
        $stranger = AlumniProfile::factory()->approved()->create();
        $this->actingAs($requester->user)->post(route('alumni.contacts.store', $target), ['message' => 'Mari bersilaturahmi'])->assertSessionHasNoErrors();
        $contact = ContactRequest::firstOrFail();
        $this->getJson(route('alumni.contacts.show', $contact))->assertForbidden();
        $this->post(route('alumni.contacts.store', $target), ['message' => 'Duplikat'])->assertSessionHasErrors('message');
        $this->actingAs($stranger->user)->put(route('alumni.contacts.update', $contact), ['status' => 'approved'])->assertForbidden();
        $this->actingAs($target->user)->put(route('alumni.contacts.update', $contact), ['status' => 'approved'])->assertSessionHasNoErrors();
        $this->getJson(route('alumni.contacts.show', $contact))->assertForbidden();
        $this->actingAs($stranger->user)->getJson(route('alumni.contacts.show', $contact))->assertForbidden();
        $this->actingAs($requester->user)->getJson(route('alumni.contacts.show', $contact))->assertOk()->assertJson(['phone_whatsapp' => '628123456789', 'email' => $target->user->email]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'contact.viewed', 'actor_id' => $requester->user_id]);
    }

    public function test_daily_contact_limit_is_enforced(): void
    {
        config(['alumni.contact_daily_limit' => 1]);
        $requester = AlumniProfile::factory()->approved()->create();
        $targets = AlumniProfile::factory()->approved()->count(2)->create();
        $this->actingAs($requester->user)->post(route('alumni.contacts.store', $targets[0]), ['message' => 'Salam'])->assertSessionHasNoErrors();
        $this->post(route('alumni.contacts.store', $targets[1]), ['message' => 'Salam'])->assertTooManyRequests();
    }

    public function test_download_contains_only_own_profile_and_no_claim_hash(): void
    {
        $own = AlumniProfile::factory()->create(['claim_code_hash' => 'secret-hash']);
        $other = AlumniProfile::factory()->create(['full_name' => 'RAHASIA ORANG LAIN']);
        ContactRequest::create(['requester_profile_id' => $own->id, 'target_profile_id' => $other->id, 'message' => 'PESAN SAYA']);
        $third = AlumniProfile::factory()->create();
        ContactRequest::create(['requester_profile_id' => $other->id, 'target_profile_id' => $third->id, 'message' => 'PESAN MILIK ORANG LAIN']);
        $response = $this->actingAs($own->user)->get(route('alumni.data.show'))->assertOk();
        $data = $response->streamedContent();
        $this->assertStringContainsString($own->full_name, $data);
        $this->assertStringNotContainsString($other->full_name, $data);
        $this->assertStringNotContainsString('secret-hash', $data);
        $this->assertStringContainsString('PESAN SAYA', $data);
        $this->assertStringNotContainsString('PESAN MILIK ORANG LAIN', $data);
    }

    public function test_permanent_deletion_removes_photo_contact_and_consent_without_personal_audit_data(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('alumni/photo.png', 'image');
        $own = AlumniProfile::factory()->approved()->create(['photo_path' => 'alumni/photo.png']);
        $other = AlumniProfile::factory()->approved()->create();
        ContactRequest::create(['requester_profile_id' => $own->id, 'target_profile_id' => $other->id, 'message' => 'Salam']);
        ConsentRecord::create(['user_id' => $own->user_id, 'profile_id' => $own->id, 'type' => 'privacy_policy', 'version' => '1', 'granted' => true, 'recorded_at' => now()]);
        $this->actingAs($own->user)->delete(route('alumni.data.destroy'), ['password' => 'password', 'confirmation' => 'HAPUS'])->assertRedirect(route('home'));
        $this->assertDatabaseMissing('alumni_profiles', ['id' => $own->id]);
        $this->assertDatabaseMissing('users', ['id' => $own->user_id]);
        $this->assertDatabaseEmpty('contact_requests');
        $this->assertDatabaseEmpty('consent_records');
        Storage::disk('local')->assertMissing('alumni/photo.png');
        $audit = AuditLog::where('action', 'account.deleted')->firstOrFail();
        $this->assertNull($audit->actor_id);
        $this->assertNull($audit->subject_id);
        $this->assertStringNotContainsString($own->full_name, $audit->toJson());
    }
}
