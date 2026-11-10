<?php

namespace Tests\Feature;

use App\AdminRole;
use App\Models\User;
use App\UserRole;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminRoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_admin_role_can_reach_every_admin_module(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        foreach (['admin.psb.dashboard', 'admin.events.index', 'admin.articles.index', 'admin.alumni.index', 'admin.santri.index'] as $route) {
            $this->get(route($route))->assertOk();
        }
    }

    public function test_editor_and_author_enter_the_panel_but_only_manage_articles(): void
    {
        foreach ([User::factory()->editor()->create(), User::factory()->author()->create()] as $staff) {
            $this->actingAs($staff);
            $this->get(route('dashboard'))->assertOk();
            $this->get(route('admin.articles.index'))->assertOk();
            foreach (['admin.psb.dashboard', 'admin.events.index', 'admin.alumni.index', 'admin.santri.index'] as $route) {
                $this->get(route($route))->assertForbidden();
            }
        }
    }

    public function test_staff_account_without_a_role_is_denied_everywhere_by_default(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        foreach (['admin.psb.dashboard', 'admin.events.index', 'admin.articles.index', 'admin.alumni.index'] as $route) {
            $this->get(route($route))->assertForbidden();
        }
    }

    public function test_admin_role_on_an_alumni_account_grants_nothing(): void
    {
        $user = User::factory()->create();
        $user->assignRole(AdminRole::Admin->value);

        $this->assertFalse($user->isAdmin());
        $this->actingAs($user)->get(route('admin.psb.dashboard'))->assertForbidden();
    }

    public function test_shared_props_follow_the_role(): void
    {
        $this->actingAs(User::factory()->editor()->create())->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
            ->where('articleAccess.canWrite', true)
            ->where('psbAccess.canManage', false)
            ->where('eventAccess.canManage', false)
            ->where('alumniAdminAccess.canManage', false)
        );
        $this->actingAs(User::factory()->admin()->create())->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
            ->where('psbAccess.canManage', true)
            ->where('alumniAdminAccess.canManage', true)
        );
    }

    public function test_make_admin_command_assigns_the_requested_role(): void
    {
        $user = User::factory()->create(['email' => 'staff@example.test']);

        $this->artisan('app:make-admin', ['email' => 'staff@example.test', '--role' => 'editor'])->assertSuccessful();
        $user->refresh();
        $this->assertTrue($user->canAccessAdminPanel());
        $this->assertSame(['editor'], $user->getRoleNames()->all());

        $this->artisan('app:make-admin', ['email' => 'staff@example.test'])->assertSuccessful();
        $this->assertSame(['admin'], $user->fresh()->getRoleNames()->all());
        $this->artisan('app:make-admin', ['email' => 'staff@example.test', '--role' => 'owner'])->assertFailed();
    }
}
