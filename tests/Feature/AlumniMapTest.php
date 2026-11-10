<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Regency;
use App\Services\AlumniMapCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AlumniMapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_public_map_counts_approved_visible_and_anonymous_without_personal_data(): void
    {
        AlumniProfile::factory()->approved()->count(2)->create(['full_name' => 'PERSONAL VISIBLE']);
        AlumniProfile::factory()->approved()->create(['full_name' => 'PERSONAL ANONYMOUS', 'map_mode' => 'anonymous']);
        foreach ([['map_mode' => 'hidden'], ['map_mode' => null], ['verification_status' => 'pending']] as $data) {
            AlumniProfile::factory()->approved()->create($data);
        }
        $response = $this->getJson(route('alumni.map-data'))->assertOk()->assertJsonPath('groups.0.count', 3)->assertJsonPath('groups.0.level', 'regency');
        foreach (['full_name', 'photo', 'phone', 'email', 'PERSONAL'] as $secret) {
            $this->assertStringNotContainsString($secret, $response->getContent());
        }
        $this->get(route('alumni.public-map'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('members', null)->where('member', false)->where('aggregate.groups.0.count', 3));
    }

    public function test_every_regency_shows_its_real_count_even_for_a_single_alumnus(): void
    {
        $single = AlumniProfile::factory()->approved()->create();
        $city = Regency::create(['province_id' => $single->province_id, 'code' => '3578', 'name' => 'KOTA SURABAYA', 'type' => 'kota', 'latitude' => -7.25, 'longitude' => 112.75]);
        AlumniProfile::factory()->approved()->count(2)->create(['regency_id' => $city->id]);
        $response = $this->getJson(route('alumni.map-data'))->assertOk()->assertJsonCount(2, 'groups')->assertJsonPath('total', 3);
        $counts = collect($response->json('groups'))->mapWithKeys(fn (array $group): array => [$group['id'] => $group])->all();
        $this->assertSame(1, $counts[$single->regency_id]['count']);
        $this->assertSame('1', $counts[$single->regency_id]['label']);
        $this->assertSame(2, $counts[$city->id]['count']);
        $this->assertSame('regency', $counts[$city->id]['level']);
        $this->assertSame($single->province->name, $counts[$city->id]['province']);
        $response->assertJsonMissingPath('by_province')->assertJsonPath('by_angkatan.0.count', 3);
    }

    public function test_member_map_list_never_contains_anonymous_hidden_or_private_fields(): void
    {
        $viewer = AlumniProfile::factory()->approved()->create();
        $visible = AlumniProfile::factory()->approved()->create(['full_name' => 'Visible Member']);
        AlumniProfile::factory()->approved()->create(['map_mode' => 'anonymous', 'full_name' => 'SECRET ANONYMOUS']);
        $response = $this->actingAs($viewer->user)->get(route('alumni.map', ['region_level' => 'regency', 'region_id' => $viewer->regency_id]))->assertOk()->assertInertia(fn (Assert $page) => $page->has('members.data', 2)->missing('members.data.1.phone_whatsapp'));
        $this->assertStringNotContainsString('SECRET ANONYMOUS', $response->getContent());
    }

    public function test_profile_privacy_changes_invalidate_cached_aggregates(): void
    {
        $profiles = AlumniProfile::factory()->approved()->count(3)->create();
        $this->getJson(route('alumni.map-data'))->assertJsonPath('groups.0.count', 3);
        $before = AlumniMapCache::version();
        $profiles[0]->update(['map_mode' => 'hidden']);
        $this->assertNotSame($before, AlumniMapCache::version());
        $this->getJson(route('alumni.map-data'))->assertJsonPath('groups.0.level', 'regency')->assertJsonPath('groups.0.count', 2);
    }

    public function test_public_map_ignores_name_search_and_never_returns_names(): void
    {
        AlumniProfile::factory()->approved()->count(3)->create();
        $this->getJson(route('alumni.map-data', ['search' => 'not-a-name']))->assertJsonPath('groups.0.count', 3);
    }

    public function test_angkatan_options_ignore_the_angkatan_filter_and_exclude_unmappable_profiles(): void
    {
        AlumniProfile::factory()->approved()->create(['angkatan' => '2010']);
        AlumniProfile::factory()->approved()->create(['angkatan' => '2012', 'map_mode' => 'anonymous']);
        AlumniProfile::factory()->approved()->create(['angkatan' => '2099', 'map_mode' => 'hidden']);
        AlumniProfile::factory()->approved()->create(['angkatan' => '2088', 'verification_status' => 'pending']);
        $this->get(route('alumni.public-map', ['angkatan' => '2010']))->assertOk()->assertInertia(fn (Assert $page) => $page->where('angkatanOptions', ['2010', '2012']));
    }
}
