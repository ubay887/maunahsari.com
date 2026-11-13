<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Santri;
use App\Models\User;
use App\Services\AlumniPrivacy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAlumniTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_verification_requires_rejection_reason_and_records_decision(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = AlumniProfile::factory()->create();
        $this->actingAs($admin)->patch(route('admin.alumni.verify', $profile), ['status' => 'rejected'])->assertSessionHasErrors('rejection_reason');
        $this->patch(route('admin.alumni.verify', $profile), ['status' => 'rejected', 'rejection_reason' => 'Tahun masuk perlu diperiksa'])->assertSessionHasNoErrors();
        $this->assertSame('rejected', $profile->fresh()->verification_status->value);
        $this->assertSame('Tahun masuk perlu diperiksa', $profile->fresh()->rejection_reason);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id, 'action' => 'profile.rejected']);
        $santri = Santri::factory()->create();
        $this->patch(route('admin.alumni.verify', $profile), ['status' => 'approved', 'santri_id' => $santri->id])->assertSessionHasNoErrors();
        $profile->update(['phone_whatsapp' => '628123456789']);
        $this->get(route('admin.alumni.edit', $profile))->assertOk();
        $this->assertDatabaseHas('audit_logs', ['action' => 'contact.viewed', 'subject_type' => 'alumni_profile', 'subject_id' => $profile->id, 'actor_id' => $admin->id]);
        $this->assertSame('approved', $profile->fresh()->verification_status->value);
        $this->assertSame($santri->id, $profile->fresh()->santri_id);
        $this->assertNull($profile->fresh()->rejection_reason);
    }

    public function test_admin_cannot_register_alumni_manually_or_import_them(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->get('/admin/alumni/buat')->assertClientError();
        $this->post('/admin/alumni', [])->assertStatus(405);
        $this->get('/admin/alumni/impor')->assertClientError();
        $this->assertDatabaseEmpty('alumni_profiles');
    }

    public function test_admin_update_ignores_privacy_and_user_assignment_and_links_santri_only_explicitly(): void
    {
        $profile = AlumniProfile::factory()->create();
        $owner = $profile->user_id;
        $data = array_intersect_key(AlumniProfile::factory()->make(['full_name' => 'Nama Baru'])->toArray(), array_flip(AlumniPrivacy::EDITABLE));
        $this->actingAs(User::factory()->admin()->create())->post(route('admin.alumni.update', $profile), [...$data, 'map_mode' => 'visible', 'directory_visible' => true, 'user_id' => 999])->assertSessionHasNoErrors();
        $saved = $profile->fresh();
        $this->assertSame('Nama Baru', $saved->full_name);
        $this->assertSame($owner, $saved->user_id);
        $this->assertNull($saved->map_mode);
        $this->assertNull($saved->directory_visible);
        $this->assertNull($saved->santri_id);
    }

    public function test_admin_list_has_server_side_filters_sort_and_pagination(): void
    {
        AlumniProfile::factory()->count(21)->create(['angkatan' => '2005']);
        AlumniProfile::factory()->create(['angkatan' => '2006']);
        $this->actingAs(User::factory()->admin()->create())->get(route('admin.alumni.index', ['angkatan' => '2005', 'per_page' => 10, 'sort' => 'full_name', 'direction' => 'asc']))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 10)->where('profiles.total', 21)->missing('profiles.data.0.photo_path')->missing('profiles.data.0.phone_whatsapp')->missing('profiles.data.0.bio'));
        $this->get(route('admin.alumni.index', ['sort' => 'email;DROP TABLE users']))->assertSessionHasErrors('sort');
    }

    public function test_export_is_audited(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = AlumniProfile::factory()->create();
        $response = $this->actingAs($admin)->get(route('admin.alumni.export'))->assertDownload('alumni.csv');
        $this->assertStringContainsString($profile->full_name, $response->streamedContent());
        $this->assertDatabaseHas('audit_logs', ['action' => 'alumni.exported']);
    }
}
