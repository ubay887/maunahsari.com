<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AlumniPrivacyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_directory_only_sends_explicitly_visible_approved_profiles_and_allowed_fields(): void
    {
        $viewer = AlumniProfile::factory()->approved()->create();
        $shown = AlumniProfile::factory()->approved()->create(['full_name' => 'BOLEH TERLIHAT', 'phone_whatsapp' => '628999999999', 'profession' => 'PROFESI PRIVAT', 'organization' => 'ORGANISASI PRIVAT', 'photo_path' => 'private/photo.png', 'field_visibility' => ['full_name' => 'alumni']]);
        foreach ([['map_mode' => 'hidden'], ['map_mode' => null], ['map_mode' => 'anonymous'], ['directory_visible' => false], ['directory_visible' => null], ['verification_status' => 'pending']] as $data) {
            AlumniProfile::factory()->approved()->create([...$data, 'full_name' => 'JANGAN TERKIRIM']);
        }
        $response = $this->actingAs($viewer->user)->get(route('alumni.directory'))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 2)->where('profiles.data.1.id', $shown->id)->where('profiles.data.1.full_name', 'BOLEH TERLIHAT')->missing('profiles.data.1.phone_whatsapp')->missing('profiles.data.1.profession')->missing('profiles.data.1.organization')->missing('profiles.data.1.photo')->missing('profiles.data.1.user_id'));
        foreach (['JANGAN TERKIRIM', 'PROFESI PRIVAT', 'ORGANISASI PRIVAT', '628999999999', $shown->user->email, 'private/photo.png'] as $secret) {
            $this->assertStringNotContainsString($secret, $response->getContent());
        }
        $this->get(route('alumni.photo', $shown))->assertNotFound();
    }

    public function test_private_name_is_not_searchable_and_hidden_photo_cannot_be_accessed_by_guessing_id(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('photo.png', 'image');
        $viewer = AlumniProfile::factory()->approved()->create();
        AlumniProfile::factory()->approved()->create(['full_name' => 'SecretName', 'field_visibility' => ['full_name' => 'private']]);
        $hidden = AlumniProfile::factory()->approved()->create(['full_name' => 'HiddenName', 'field_visibility' => ['full_name' => 'private'], 'photo_path' => 'photo.png', 'map_mode' => 'hidden']);
        $this->actingAs($viewer->user)->get(route('alumni.directory', ['search' => 'SecretName']))->assertInertia(fn (Assert $page) => $page->has('profiles.data', 0));
        $this->get(route('alumni.photo', $hidden))->assertForbidden();
    }

    public function test_pending_alumni_cannot_access_directory_or_contacts_and_guests_must_log_in(): void
    {
        $this->get(route('alumni.directory'))->assertRedirect(route('login'));
        $profile = AlumniProfile::factory()->create();
        $this->actingAs($profile->user)->get(route('alumni.directory'))->assertForbidden();
        $this->get(route('alumni.contacts.index'))->assertForbidden();
    }
}
