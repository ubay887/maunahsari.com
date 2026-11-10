<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AlumniRadarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_radar_filters_radius_excludes_self_and_returns_only_distance_bands(): void
    {
        $own = AlumniProfile::factory()->approved()->create();
        $near = Regency::create(['province_id' => $own->province_id, 'code' => '3501', 'name' => 'Wilayah Dekat', 'type' => 'kabupaten', 'latitude' => -7.82, 'longitude' => 112.11]);
        $medium = Regency::create(['province_id' => $own->province_id, 'code' => '3502', 'name' => 'Wilayah Menengah', 'type' => 'kabupaten', 'latitude' => -7.82, 'longitude' => 112.41]);
        $far = Regency::create(['province_id' => $own->province_id, 'code' => '3503', 'name' => 'Wilayah Jauh', 'type' => 'kabupaten', 'latitude' => -7.82, 'longitude' => 114.5]);
        $nearProfile = AlumniProfile::factory()->approved()->create(['regency_id' => $near->id, 'profession' => 'Guru', 'field_visibility' => ['full_name' => 'alumni', 'profession' => 'alumni']]);
        AlumniProfile::factory()->approved()->create(['regency_id' => $medium->id]);
        AlumniProfile::factory()->approved()->create(['regency_id' => $far->id]);
        foreach ([['map_mode' => 'hidden'], ['map_mode' => null], ['map_mode' => 'anonymous'], ['directory_visible' => false], ['directory_visible' => null], ['verification_status' => 'pending']] as $data) {
            AlumniProfile::factory()->approved()->create([...$data, 'full_name' => 'RADAR SECRET']);
        }
        $this->actingAs($own->user)->get(route('alumni.radar', ['radius' => 25]))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 1)->where('profiles.data.0.id', $nearProfile->id)->where('profiles.data.0.distance_band', 'dalam 25 km')->missing('profiles.data.0.distance')->missing('profiles.data.0.latitude')->missing('profiles.data.0.phone_whatsapp'));
        $this->get(route('alumni.radar', ['radius' => 50]))->assertInertia(fn (Assert $page) => $page->has('profiles.data', 2)->where('profiles.data.1.distance_band', 'dalam 50 km'));
        $this->get(route('alumni.radar', ['radius' => 50, 'profession' => 'Guru']))->assertInertia(fn (Assert $page) => $page->has('profiles.data', 1));
        $this->get(route('alumni.radar', ['radius' => 999]))->assertSessionHasErrors('radius');
    }

    public function test_pending_alumni_and_guests_cannot_open_radar(): void
    {
        $this->get(route('alumni.radar'))->assertRedirect(route('login'));
        $own = AlumniProfile::factory()->create();
        $this->actingAs($own->user)->get(route('alumni.radar'))->assertForbidden();
    }

    public function test_admin_statistics_are_aggregates_and_completeness_is_calculated_per_cohort(): void
    {
        AlumniProfile::factory()->approved()->create(['angkatan' => '2010', 'phone_whatsapp' => '628123456789', 'profession' => 'Guru', 'bio' => 'Pendidik', 'skills' => ['Mengajar']]);
        AlumniProfile::factory()->create(['angkatan' => '2010']);
        $response = $this->actingAs(User::factory()->admin()->create())->get(route('admin.alumni.statistics'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('statistics.total', 2)->where('statistics.approved', 1)->where('statistics.pending', 1)->where('statistics.verified_percentage', 50)->where('statistics.completeness.0.percentage', 50));
        $this->assertStringNotContainsString('628123456789', $response->getContent());
    }
}
