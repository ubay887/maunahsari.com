<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Santri;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminListPageSizeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
        $this->actingAs(User::factory()->admin()->create());
    }

    public function test_santri_list_defaults_to_ten_rows_and_accepts_allowed_page_sizes(): void
    {
        Santri::factory()->count(12)->create();

        $this->get(route('admin.santri.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('santris.data', 10)->where('santris.per_page', 10));
        $this->get(route('admin.santri.index', ['per_page' => 25]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('santris.data', 12)->where('santris.per_page', 25));
        $this->get(route('admin.santri.index', ['per_page' => 7]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('santris.per_page', 10));
    }

    public function test_alumni_list_defaults_to_ten_rows(): void
    {
        AlumniProfile::factory()->count(12)->create();

        $this->get(route('admin.alumni.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('profiles.data', 10)->where('profiles.per_page', 10));
    }
}
