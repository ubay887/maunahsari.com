<?php

namespace Tests\Feature;

use App\Actions\Fortify\CreateNewUser;
use App\Models\AlumniProfile;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\UserRole;
use Database\Seeders\AlumniRegionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AlumniFoundationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_all_admin_routes_refuse_alumni_before_binding(): void
    {
        $this->actingAs(User::factory()->create());
        $count = 0;
        foreach (Route::getRoutes() as $route) {
            if (! str_starts_with($route->uri(), 'admin/') && ! in_array($route->getName(), ['dashboard'], true)) {
                continue;
            }
            $uri = preg_replace_callback('/\{([^}]+)\}/', fn (array $match): string => str_starts_with($match[1], 'taxonomy') ? 'tags' : '999999', $route->uri());
            foreach ($route->methods() as $method) {
                $this->call($method, '/'.$uri)->assertForbidden();
                $count++;
            }
        }
        $this->assertGreaterThan(50, $count);
    }

    public function test_registration_action_ignores_an_injected_admin_role(): void
    {
        $user = app(CreateNewUser::class)->create(['name' => 'Alumni', 'email' => 'new@example.test', 'password' => 'password', 'password_confirmation' => 'password', 'role' => 'admin']);
        $this->assertSame(UserRole::Alumni, $user->fresh()->role);
    }

    public function test_login_redirects_by_role_even_with_an_admin_intended_url(): void
    {
        $alumni = User::factory()->create();
        $this->withSession(['url.intended' => '/dashboard'])->post(route('login.store'), ['email' => $alumni->email, 'password' => 'password'])->assertRedirect(route('alumni.home'));
    }

    public function test_guests_redirect_to_login(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->get(route('alumni.home'))->assertRedirect(route('login'));
    }

    public function test_region_seeding_is_idempotent_and_sample_coordinates_are_in_the_expected_area(): void
    {
        $this->seed(AlumniRegionSeeder::class);
        $counts = [Province::count(), Regency::count()];
        $this->seed(AlumniRegionSeeder::class);
        $this->assertSame($counts, [Province::count(), Regency::count()]);
        $this->assertGreaterThanOrEqual(38, $counts[0]);
        $this->assertGreaterThanOrEqual(514, $counts[1]);
        foreach (['3571' => [-8.0, -7.6, 111.8, 112.3], '3273' => [-7.1, -6.7, 107.3, 107.9], '3471' => [-8.0, -7.5, 110.1, 110.6]] as $code => $bounds) {
            $region = Regency::where('code', $code)->firstOrFail();
            $this->assertGreaterThan($bounds[0], $region->latitude);
            $this->assertLessThan($bounds[1], $region->latitude);
            $this->assertGreaterThan($bounds[2], $region->longitude);
            $this->assertLessThan($bounds[3], $region->longitude);
        }
    }

    public function test_personal_settings_remain_available_to_alumni(): void
    {
        $this->actingAs(User::factory()->create())->get(route('profile.edit'))->assertOk();
    }

    public function test_admin_is_kept_out_of_the_alumni_portal_but_can_still_load_profile_photos(): void
    {
        $profile = AlumniProfile::factory()->approved()->create();
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get(route('alumni.home'))->assertRedirect(route('admin.alumni.index'));
        $this->actingAs($admin)->get(route('alumni.profile.edit'))->assertRedirect(route('admin.alumni.index'));
        $this->actingAs($admin)->get(route('alumni.data.index'))->assertRedirect(route('admin.alumni.index'));
        $this->actingAs($admin)->post(route('alumni.profile.update'), [])->assertForbidden();
        $this->actingAs($admin)->get(route('alumni.map'))->assertRedirect(route('admin.alumni.index'));
        $this->actingAs($admin)->get(route('alumni.photo', $profile))->assertNotFound();
        $this->actingAs($profile->user)->get(route('alumni.home'))->assertOk();
    }
}
