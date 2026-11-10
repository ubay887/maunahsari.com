<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Applicant;
use App\Models\Event;
use App\Models\Program;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Services\DashboardFeeds;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_read_a_feed(): void
    {
        $this->getJson(route('dashboard.feed', 'applicants'))->assertUnauthorized();
    }

    public function test_applicants_feed_returns_the_newest_rows_page_by_page_and_stops_at_the_cap(): void
    {
        $period = RegistrationPeriod::factory()->create(['is_open' => false]);
        $program = Program::factory()->create();
        $applicants = Applicant::factory()->count(DashboardFeeds::MAX_ITEMS + 5)
            ->create(['registration_period_id' => $period->id, 'program_id' => $program->id]);
        $newestFirst = $applicants->sortByDesc('id')->values();
        $this->actingAs(User::factory()->admin()->create());

        $first = $this->getJson(route('dashboard.feed', 'applicants'))->assertOk();
        $first->assertJsonCount(DashboardFeeds::PAGE_SIZE, 'data')->assertJsonPath('next_page', 2)
            ->assertJsonPath('data.0.id', $newestFirst[0]->id)
            ->assertJsonMissingPath('data.0.nik');

        $this->getJson(route('dashboard.feed', ['feed' => 'applicants', 'page' => 2]))->assertOk()
            ->assertJsonPath('data.0.id', $newestFirst[DashboardFeeds::PAGE_SIZE]->id);

        $lastPage = (int) ceil(DashboardFeeds::MAX_ITEMS / DashboardFeeds::PAGE_SIZE);
        $this->getJson(route('dashboard.feed', ['feed' => 'applicants', 'page' => $lastPage]))->assertOk()
            ->assertJsonCount(DashboardFeeds::PAGE_SIZE, 'data')->assertJsonPath('next_page', null);
        $this->getJson(route('dashboard.feed', ['feed' => 'applicants', 'page' => $lastPage + 1]))->assertOk()
            ->assertExactJson(['data' => [], 'next_page' => null]);
    }

    public function test_short_lists_report_no_next_page(): void
    {
        AlumniProfile::factory()->count(3)->create();
        Event::factory()->published()->count(2)->create();
        $this->actingAs(User::factory()->admin()->create());

        $this->getJson(route('dashboard.feed', 'alumni'))->assertOk()->assertJsonCount(3, 'data')->assertJsonPath('next_page', null);
        $this->getJson(route('dashboard.feed', 'events'))->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('next_page', null);
    }

    public function test_alumni_feed_lists_the_oldest_pending_profiles_first(): void
    {
        $pending = AlumniProfile::factory()->count(DashboardFeeds::PAGE_SIZE + 2)->create();
        AlumniProfile::factory()->approved()->create();
        $this->actingAs(User::factory()->admin()->create());

        $this->getJson(route('dashboard.feed', ['feed' => 'alumni', 'page' => 2]))->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $pending[DashboardFeeds::PAGE_SIZE]->id);
    }

    public function test_a_feed_requires_access_to_its_module(): void
    {
        $this->actingAs(User::factory()->author()->create());

        $this->getJson(route('dashboard.feed', 'applicants'))->assertForbidden();
        $this->getJson(route('dashboard.feed', 'events'))->assertForbidden();
        $this->getJson(route('dashboard.feed', 'alumni'))->assertForbidden();
    }

    public function test_an_unknown_feed_is_not_found(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->getJson(route('dashboard.feed', 'articles'))->assertNotFound();
    }
}
