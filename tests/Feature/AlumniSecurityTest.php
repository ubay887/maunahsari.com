<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\ContactRequest;
use App\Models\User;
use App\Services\AlumniPrivacy;
use App\UserRole;
use Illuminate\Database\Eloquent\MassAssignmentException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Laravel\Passkeys\Contracts\PasskeyLoginResponse;
use Tests\TestCase;

class AlumniSecurityTest extends TestCase
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
        $profile = AlumniProfile::factory()->make(['user_id' => null]);

        return [...array_intersect_key($profile->toArray(), array_flip(AlumniPrivacy::EDITABLE)), 'map_mode' => 'visible', 'directory_visible' => true, 'field_visibility' => ['full_name' => 'alumni'], 'privacy_consent' => true, 'privacy_version' => config('alumni.privacy_version')];
    }

    public function test_registration_is_throttled_even_for_invalid_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('register.store'), [])->assertSessionHasErrors('email');
        }
        $this->post(route('register.store'), [])->assertTooManyRequests();
        $this->assertDatabaseEmpty('users');
    }

    public function test_complete_registration_rejection_resubmission_and_approval_flow(): void
    {
        $this->post(route('register.store'), ['name' => 'Alumni Baru', 'email' => 'flow@example.test', 'password' => 'password', 'password_confirmation' => 'password', 'role' => 'admin'])->assertRedirect(route('alumni.home'));
        $user = User::where('email', 'flow@example.test')->firstOrFail();
        $this->assertSame(UserRole::Alumni, $user->role);
        $this->get(route('alumni.profile.edit'))->assertOk();
        $data = $this->data();
        $this->post(route('alumni.profile.update'), $data)->assertSessionHasNoErrors();
        $profile = $user->alumniProfile()->firstOrFail();
        $this->get(route('alumni.directory'))->assertForbidden();
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->patch(route('admin.alumni.verify', $profile), ['status' => 'rejected', 'rejection_reason' => 'Perbaiki angkatan'])->assertSessionHasNoErrors();
        $this->actingAs($user->fresh())->post(route('alumni.profile.update'), [...$data, 'angkatan' => '2011'])->assertSessionHasNoErrors();
        $this->assertSame('pending', $profile->fresh()->verification_status->value);
        $this->assertNull($profile->fresh()->rejection_reason);
        $this->actingAs($admin)->patch(route('admin.alumni.verify', $profile), ['status' => 'approved'])->assertSessionHasNoErrors();
        $this->actingAs($user->fresh())->get(route('alumni.directory'))->assertOk();
    }

    public function test_json_registration_keeps_the_fortify_created_status(): void
    {
        Notification::fake();
        $this->postJson(route('register.store'), ['name' => 'Alumni JSON', 'email' => 'json@example.test', 'password' => 'password', 'password_confirmation' => 'password', 'role' => 'admin'])->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'json@example.test', 'role' => 'alumni']);
    }

    public function test_passkey_response_redirects_each_role_and_discards_an_admin_intended_url(): void
    {
        foreach ([User::factory()->create(), User::factory()->admin()->create()] as $user) {
            $request = Request::create('/passkeys/login', 'POST', server: ['HTTP_ACCEPT' => 'application/json']);
            $request->setLaravelSession(app('session')->driver());
            $request->session()->put('url.intended', '/dashboard');
            $request->setUserResolver(fn () => $user);
            $response = app(PasskeyLoginResponse::class)->toResponse($request);
            $this->assertSame(route($user->isAdmin() ? 'dashboard' : 'alumni.home'), $response->getData(true)['redirect']);
            $this->assertFalse($request->session()->has('url.intended'));
        }
    }

    public function test_account_deletion_also_purges_a_previously_soft_deleted_profile(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('soft-photo.png', 'image');
        $profile = AlumniProfile::factory()->approved()->create(['photo_path' => 'soft-photo.png']);
        $user = $profile->user;
        $profile->delete();
        $this->actingAs($user)->delete(route('alumni.data.destroy'), ['password' => 'password', 'confirmation' => 'HAPUS'])->assertRedirect(route('home'));
        $this->assertDatabaseMissing('alumni_profiles', ['id' => $profile->id]);
        Storage::disk('local')->assertMissing('soft-photo.png');
    }

    public function test_existing_users_become_admin_during_role_migration_but_new_users_default_to_alumni(): void
    {
        $existing = User::factory()->create();
        $migration = require database_path('migrations/2026_11_03_060740_add_role_to_users_table.php');
        $migration->down();
        $migration->up();
        $this->assertSame('admin', $existing->fresh()->role->value);
        $new = new User(['name' => 'Default Alumni', 'email' => 'default@example.test', 'password' => 'password']);
        $new->save();
        $this->assertSame('alumni', $new->fresh()->role->value);

        $this->expectException(MassAssignmentException::class);
        $new->fill(['role' => 'admin']);
    }

    public function test_all_admin_routes_redirect_guests_to_login(): void
    {
        foreach (Route::getRoutes() as $route) {
            if (! str_starts_with($route->uri(), 'admin/') && ! in_array($route->getName(), ['dashboard', 'showcase.data-grid'], true)) {
                continue;
            }
            $uri = preg_replace_callback('/\{([^}]+)\}/', fn (array $match): string => str_starts_with($match[1], 'taxonomy') ? 'tags' : '999999', $route->uri());
            $this->call($route->methods()[0], '/'.$uri)->assertRedirect(route('login'));
        }
    }

    public function test_profile_rejects_mismatched_region_non_lists_and_untrusted_social_urls(): void
    {
        $this->actingAs(User::factory()->create())->post(route('alumni.profile.update'), [...$this->data(), 'province_id' => 99999, 'skills' => ['bad' => 'value'], 'open_to' => ['bad' => 'mentoring'], 'social_links' => ['website' => 'javascript:alert(1)']])->assertSessionHasErrors(['province_id', 'regency_id', 'skills', 'open_to', 'social_links.website']);
        $this->assertDatabaseEmpty('alumni_profiles');
    }

    public function test_photo_is_reencoded_private_and_only_shared_with_explicit_photo_visibility(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create();
        $this->actingAs($owner)->post(route('alumni.profile.update'), [...$this->data(), 'photo' => UploadedFile::fake()->image('original-name.jpg')])->assertSessionHasNoErrors();
        $profile = $owner->alumniProfile()->firstOrFail();
        $this->assertStringEndsWith('.webp', $profile->photo_path);
        $this->get(route('alumni.photo', $profile))->assertOk()->assertHeader('Content-Type', 'image/webp');
        $profile->update(['verification_status' => 'approved']);
        $viewer = AlumniProfile::factory()->approved()->create();
        $this->actingAs($viewer->user)->get(route('alumni.photo', $profile))->assertNotFound();
        $profile->update(['field_visibility' => ['photo' => 'alumni']]);
        $this->get(route('alumni.photo', $profile))->assertOk();
    }

    public function test_approved_claimant_without_privacy_choices_cannot_access_another_profile_photo(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('photo.png', 'image');
        $viewer = AlumniProfile::factory()->approved()->create(['map_mode' => null, 'directory_visible' => null]);
        $target = AlumniProfile::factory()->approved()->create(['photo_path' => 'photo.png', 'field_visibility' => ['photo' => 'alumni']]);
        $this->actingAs($viewer->user)->get(route('alumni.photo', $target))->assertForbidden();
    }

    public function test_old_settings_account_deletion_also_cleans_up_alumni_profile(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('old-photo.png', 'image');
        $profile = AlumniProfile::factory()->approved()->create(['photo_path' => 'old-photo.png']);
        $this->actingAs($profile->user)->delete(route('profile.destroy'), ['password' => 'password'])->assertRedirect();
        $this->assertDatabaseMissing('alumni_profiles', ['id' => $profile->id]);
        Storage::disk('local')->assertMissing('old-photo.png');
    }

    public function test_declined_and_expired_contacts_do_not_reveal_contact_data(): void
    {
        $requester = AlumniProfile::factory()->approved()->create();
        $target = AlumniProfile::factory()->approved()->create();
        $contact = ContactRequest::create(['requester_profile_id' => $requester->id, 'target_profile_id' => $target->id, 'message' => 'Salam', 'status' => 'pending', 'expires_at' => now()->subMinute()]);
        $this->actingAs($target->user)->put(route('alumni.contacts.update', $contact), ['status' => 'approved'])->assertSessionHasErrors('status');
        $this->get(route('alumni.contacts.index'))->assertOk();
        $this->assertSame('expired', $contact->fresh()->status->value);
        $this->actingAs($requester->user)->getJson(route('alumni.contacts.show', $contact))->assertForbidden();
        $contact->update(['status' => 'declined']);
        $this->getJson(route('alumni.contacts.show', $contact))->assertForbidden();
    }

    public function test_withdrawing_directory_permission_revokes_previously_approved_contact_access(): void
    {
        $requester = AlumniProfile::factory()->approved()->create();
        $target = AlumniProfile::factory()->approved()->create();
        $contact = ContactRequest::create(['requester_profile_id' => $requester->id, 'target_profile_id' => $target->id, 'message' => 'Salam', 'status' => 'approved']);
        $target->update(['directory_visible' => false]);
        $this->actingAs($requester->user)->getJson(route('alumni.contacts.show', $contact))->assertNotFound();
    }
}
