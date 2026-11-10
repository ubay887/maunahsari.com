<?php

namespace Tests\Feature;

use App\ApplicantStatus;
use App\Models\AlumniProfile;
use App\Models\Applicant;
use App\Models\Article;
use App\Models\Event;
use App\Models\Program;
use App\Models\RegistrationPeriod;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_without_module_access_receive_no_administrative_data(): void
    {
        Applicant::factory()->create();
        Article::factory()->published()->create();
        Event::factory()->published()->create();
        $this->actingAs(User::factory()->create())->get(route('dashboard'))->assertForbidden();
    }

    public function test_admin_dashboard_summarizes_the_active_period_and_only_published_upcoming_agenda(): void
    {
        $this->freezeTime();
        $admin = User::factory()->admin()->create(['email' => 'admin@example.test']);
        $period = RegistrationPeriod::factory()->create(['name' => 'Periode berjalan']);
        $oldPeriod = RegistrationPeriod::factory()->create(['is_open' => false]);
        $program = Program::factory()->create();
        $currentApplicants = [];
        foreach ([ApplicantStatus::Registered, ApplicantStatus::Verified, ApplicantStatus::Accepted] as $status) {
            $currentApplicants[] = Applicant::factory()->create(['registration_period_id' => $period->id, 'program_id' => $program->id, 'status' => $status]);
        }
        Applicant::factory()->create(['registration_period_id' => $oldPeriod->id, 'program_id' => $program->id]);
        $deleted = Applicant::factory()->create(['registration_period_id' => $period->id, 'program_id' => $program->id]);
        $deleted->delete();
        Santri::factory()->create(['applicant_id' => $currentApplicants[2]->id, 'program_id' => $program->id, 'is_active' => true]);
        Santri::factory()->create(['applicant_id' => $currentApplicants[0]->id, 'program_id' => $program->id, 'is_active' => false]);
        Article::factory()->for($admin, 'author')->published()->create();
        Article::factory()->for($admin, 'author')->create();
        Article::factory()->for($admin, 'author')->scheduled()->create();
        $ongoing = Event::factory()->published()->ongoing()->create();
        $upcoming = Event::factory()->published()->create();
        Event::factory()->published()->past()->create();
        Event::factory()->cancelled()->create();
        Event::factory()->create();

        $this->actingAs($admin)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->missing('overview')
            ->loadDeferredProps(fn (Assert $report) => $report
                ->where('overview.psb.period.id', $period->id)
                ->where('overview.psb.period.is_open', true)
                ->where('overview.psb.totalApplicants', 3)
                ->where('overview.psb.pendingApplicants', 1)
                ->where('overview.psb.acceptedApplicants', 1)
                ->where('overview.psb.activeSantri', 1)
                ->has('overview.psb.recentApplicants', 3)
                ->missing('overview.psb.recentApplicants.0.nik')
                ->missing('overview.psb.recentApplicants.0.guardian_phone')
                ->where('overview.articles', ['total' => 3, 'published' => 1, 'draft' => 1])
                ->has('overview.events', 2)
                ->where('overview.events.0.id', $ongoing->id)
                ->where('overview.events.0.phase', 'ongoing')
                ->where('overview.events.1.id', $upcoming->id)
            )
        );
    }

    public function test_author_dashboard_counts_only_their_own_articles_and_omits_psb_and_events(): void
    {
        $author = User::factory()->author()->create();
        Article::factory()->for($author, 'author')->create();
        Article::factory()->published()->create();
        Applicant::factory()->create();
        Event::factory()->published()->create();
        $this->actingAs($author)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('articleAccess.canWrite', true)->where('psbAccess.canManage', false)->where('eventAccess.canManage', false)
            ->loadDeferredProps(fn (Assert $report) => $report
                ->where('overview.psb', null)
                ->where('overview.events', null)
                ->where('overview.articles', ['total' => 1, 'published' => 0, 'draft' => 1])
            )
        );
    }

    public function test_admin_dashboard_with_no_records_returns_empty_regions(): void
    {
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $report) => $report
                ->where('overview.psb.period', null)
                ->where('overview.psb.totalApplicants', 0)
                ->where('overview.psb.activeSantri', 0)
                ->has('overview.psb.recentApplicants', 0)
                ->has('overview.events', 0)
                ->where('overview.articles.total', 0)
            )
        );
    }

    public function test_dashboard_uses_the_latest_period_when_registration_is_closed_and_limits_recent_rows(): void
    {
        $earlier = RegistrationPeriod::factory()->create(['is_open' => false]);
        $latest = RegistrationPeriod::factory()->create(['is_open' => false]);
        $program = Program::factory()->create();
        Applicant::factory()->create(['registration_period_id' => $earlier->id, 'program_id' => $program->id]);
        Applicant::factory()->count(10)->create(['registration_period_id' => $latest->id, 'program_id' => $program->id]);
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $report) => $report
                ->where('overview.psb.period.id', $latest->id)
                ->where('overview.psb.period.is_open', false)
                ->where('overview.psb.totalApplicants', 10)
                ->where('overview.feedPageSize', 8)
                ->has('overview.psb.recentApplicants', 8)
            )
        );
    }

    public function test_unverified_users_are_redirected_before_dashboard_data_is_loaded(): void
    {
        $this->actingAs(User::factory()->admin()->unverified()->create())->get(route('dashboard'))->assertRedirect(route('verification.notice'));
    }

    public function test_admin_dashboard_lists_the_oldest_pending_alumni_verifications_first(): void
    {
        $pending = AlumniProfile::factory()->count(10)->create();
        AlumniProfile::factory()->approved()->create();
        AlumniProfile::factory()->create()->delete();

        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $report) => $report
                ->where('overview.alumni.total', 11)
                ->where('overview.alumni.pending', 10)
                ->has('overview.alumni.queue', 8)
                ->where('overview.alumni.queue.0.id', $pending->first()->id)
                ->missing('overview.alumni.queue.0.phone_whatsapp')
            )
        );
    }

    public function test_admin_dashboard_without_alumni_returns_an_empty_queue(): void
    {
        $this->actingAs(User::factory()->admin()->create(['email' => 'admin@example.test']))->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $report) => $report
                ->where('overview.alumni.total', 0)
                ->where('overview.alumni.pending', 0)
                ->has('overview.alumni.queue', 0)
            )
        );
    }
}
