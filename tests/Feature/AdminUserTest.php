<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Article;
use App\Models\User;
use App\UserRole;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Support\SessionKey;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RoleSeeder::class);
    }

    public function test_only_admins_can_manage_users(): void
    {
        $target = User::factory()->editor()->create();
        $this->get(route('admin.users.index'))->assertRedirect(route('login'));

        foreach ([User::factory()->editor()->create(), User::factory()->author()->create(), User::factory()->create(), User::factory()->applicant()->create()] as $user) {
            $this->actingAs($user);
            $this->get(route('admin.users.index'))->assertForbidden();
            $this->post(route('admin.users.store'), ['name' => 'X', 'email' => 'x@example.test', 'role' => 'admin'])->assertForbidden();
            $this->patch(route('admin.users.update', $target), ['role' => 'admin'])->assertForbidden();
            $this->post(route('admin.users.password.reset', $target))->assertForbidden();
            $this->delete(route('admin.users.destroy', $target))->assertForbidden();
        }
        $this->assertSame('editor', $target->fresh()->getRoleNames()->first());
    }

    public function test_list_is_paginated_searchable_and_filterable_by_role(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'Kepala Admin']);
        User::factory()->editor()->create(['name' => 'Siti Editor', 'email' => 'siti@example.test']);
        User::factory()->create(['name' => 'Budi Alumni']);
        User::factory()->applicant()->create(['name' => 'Candra Pendaftar']);
        $this->actingAs($admin);

        $this->get(route('admin.users.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')->where('users.total', 4)->missing('users.data.0.password')->missing('users.data.0.two_factor_secret')->has('users.data.0.is_self'));
        $this->get(route('admin.users.index', ['role' => 'editor']))->assertInertia(fn (Assert $page) => $page->where('users.total', 1)->where('users.data.0.name', 'Siti Editor')->where('users.data.0.role', 'editor')->where('users.data.0.is_staff', true));
        $this->get(route('admin.users.index', ['role' => 'alumni']))->assertInertia(fn (Assert $page) => $page->where('users.total', 1)->where('users.data.0.name', 'Budi Alumni')->where('users.data.0.is_staff', false));
        $this->get(route('admin.users.index', ['role' => 'applicant']))->assertInertia(fn (Assert $page) => $page->where('users.total', 1));
        $this->get(route('admin.users.index', ['search' => 'siti@']))->assertInertia(fn (Assert $page) => $page->where('users.total', 1));
        $this->get(route('admin.users.index', ['role' => 'superuser']))->assertSessionHasErrors('role');
        $this->get(route('admin.users.index', ['sort' => 'password']))->assertSessionHasErrors('sort');
    }

    public function test_admin_creates_a_staff_account_with_a_one_time_temporary_password(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post(route('admin.users.store'), ['name' => 'Penulis Baru', 'email' => ' Penulis@Example.Test ', 'role' => 'author'])->assertSessionHasNoErrors();

        $user = User::where('email', 'penulis@example.test')->firstOrFail();
        $this->assertSame(UserRole::Admin, $user->role);
        $this->assertSame('author', $user->getRoleNames()->first());
        $flash = session(SessionKey::FLASH_DATA)['temporaryPassword'];
        $this->assertSame('penulis@example.test', $flash['email']);
        $this->assertTrue(Hash::check($flash['password'], $user->password));
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.created', 'actor_id' => $admin->id, 'subject_id' => $user->id]);
        $this->assertStringNotContainsString($flash['password'], (string) DB::table('audit_logs')->pluck('meta')->implode(' '));
    }

    public function test_staff_account_validation_rejects_duplicates_and_non_staff_roles(): void
    {
        $admin = User::factory()->admin()->create();
        $existing = User::factory()->create(['email' => 'ada@example.test']);
        $this->actingAs($admin);

        $this->post(route('admin.users.store'), ['name' => 'Ada', 'email' => 'ADA@example.test', 'role' => 'editor'])->assertSessionHasErrors('email');
        $this->post(route('admin.users.store'), ['name' => 'Alumni', 'email' => 'baru@example.test', 'role' => 'alumni'])->assertSessionHasErrors('role');
        $this->post(route('admin.users.store'), ['name' => '', 'email' => 'bukan-email', 'role' => 'editor'])->assertSessionHasErrors(['name', 'email']);
        $this->assertSame(2, User::count());
        $this->assertModelExists($existing);
    }

    public function test_admin_changes_another_staff_role_but_not_their_own_or_a_non_staff_account(): void
    {
        $admin = User::factory()->admin()->create();
        $editor = User::factory()->editor()->create();
        $alumni = User::factory()->create();
        $this->actingAs($admin);

        $this->patch(route('admin.users.update', $editor), ['role' => 'author'])->assertSessionHasNoErrors();
        $this->assertSame('author', $editor->fresh()->getRoleNames()->first());
        $this->assertCount(1, $editor->fresh()->getRoleNames());
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.role_changed', 'subject_id' => $editor->id]);
        $this->patch(route('admin.users.update', $editor), ['role' => 'alumni'])->assertSessionHasErrors('role');
        $this->patch(route('admin.users.update', $admin), ['role' => 'author'])->assertForbidden();
        $this->patch(route('admin.users.update', $alumni), ['role' => 'admin'])->assertForbidden();
        $this->assertTrue($admin->fresh()->isAdmin());
        $this->assertSame(UserRole::Alumni, $alumni->fresh()->role);
    }

    public function test_password_reset_replaces_the_password_ends_sessions_and_is_blocked_for_self(): void
    {
        $admin = User::factory()->admin()->create();
        $alumni = User::factory()->create();
        DB::table('sessions')->insert(['id' => 'abc', 'user_id' => $alumni->id, 'ip_address' => '127.0.0.1', 'user_agent' => 'test', 'payload' => '', 'last_activity' => now()->timestamp]);
        $this->actingAs($admin);

        $this->post(route('admin.users.password.reset', $alumni))->assertSessionHasNoErrors();
        $flash = session(SessionKey::FLASH_DATA)['temporaryPassword'];
        $this->assertTrue(Hash::check($flash['password'], $alumni->fresh()->password));
        $this->assertFalse(Hash::check('password', $alumni->fresh()->password));
        $this->assertDatabaseMissing('sessions', ['user_id' => $alumni->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.password_reset', 'subject_id' => $alumni->id]);
        $this->post(route('admin.users.password.reset', $admin))->assertForbidden();
    }

    public function test_admin_deletes_accounts_but_not_themselves_or_staff_with_content(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();
        $author = User::factory()->author()->create();
        Article::factory()->for($author, 'author')->create();
        $this->actingAs($admin);

        $this->delete(route('admin.users.destroy', $admin))->assertForbidden();
        $this->delete(route('admin.users.destroy', $author))->assertSessionHasErrors('user');
        $this->assertModelExists($author);
        $this->delete(route('admin.users.destroy', $applicant))->assertSessionHasNoErrors();
        $this->assertModelMissing($applicant);
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.deleted', 'actor_id' => $admin->id, 'subject_id' => $applicant->id]);
    }

    public function test_deleting_an_alumni_account_removes_the_profile_too(): void
    {
        $profile = AlumniProfile::factory()->create();
        $this->actingAs(User::factory()->admin()->create())->delete(route('admin.users.destroy', $profile->user_id))->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('users', ['id' => $profile->user_id]);
        $this->assertDatabaseEmpty('alumni_profiles');
    }
}
