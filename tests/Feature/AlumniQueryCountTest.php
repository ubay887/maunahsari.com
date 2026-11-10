<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\Program;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AlumniQueryCountTest extends TestCase
{
    use RefreshDatabase;

    private int $sequence = 0;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_directory_runs_the_same_queries_regardless_of_row_count(): void
    {
        $viewer = AlumniProfile::factory()->approved()->create()->user;
        $this->actingAs($viewer)->get(route('alumni.directory'))->assertOk();

        $this->seedVariedProfiles(2);
        $fewQueries = $this->countQueries(fn () => $this->actingAs($viewer)->get(route('alumni.directory'))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 3)));

        $this->seedVariedProfiles(8);
        $manyQueries = $this->countQueries(fn () => $this->actingAs($viewer)->get(route('alumni.directory'))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 11)));

        $this->assertSame($fewQueries, $manyQueries);
    }

    public function test_radar_runs_the_same_queries_regardless_of_row_count(): void
    {
        $viewer = AlumniProfile::factory()->approved()->create()->user;
        $this->actingAs($viewer)->get(route('alumni.radar', ['radius' => 100]))->assertOk();

        $this->seedVariedProfiles(2);
        $fewQueries = $this->countQueries(fn () => $this->actingAs($viewer)->get(route('alumni.radar', ['radius' => 100]))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 2)));

        $this->seedVariedProfiles(8);
        $manyQueries = $this->countQueries(fn () => $this->actingAs($viewer)->get(route('alumni.radar', ['radius' => 100]))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 10)));

        $this->assertSame($fewQueries, $manyQueries);
    }

    public function test_admin_list_runs_the_same_queries_regardless_of_row_count(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get(route('admin.alumni.index', ['per_page' => 10]))->assertOk();

        $this->seedVariedProfiles(2);
        $fewQueries = $this->countQueries(fn () => $this->actingAs($admin)->get(route('admin.alumni.index', ['per_page' => 10]))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 2)));

        $this->seedVariedProfiles(8);
        $manyQueries = $this->countQueries(fn () => $this->actingAs($admin)->get(route('admin.alumni.index', ['per_page' => 10]))->assertOk()->assertInertia(fn (Assert $page) => $page->has('profiles.data', 10)));

        $this->assertSame($fewQueries, $manyQueries);
    }

    public function test_statistics_runs_the_same_queries_regardless_of_row_count(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get(route('admin.alumni.statistics'))->assertOk();

        $this->seedVariedProfiles(2);
        $fewQueries = $this->countQueries(fn () => $this->actingAs($admin)->get(route('admin.alumni.statistics'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('statistics.total', 2)));

        $this->seedVariedProfiles(8);
        $manyQueries = $this->countQueries(fn () => $this->actingAs($admin)->get(route('admin.alumni.statistics'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('statistics.total', 10)));

        $this->assertSame($fewQueries, $manyQueries);
    }

    public function test_public_map_data_runs_the_same_queries_regardless_of_row_count(): void
    {
        $this->seedVariedProfiles(4);
        $fewQueries = $this->countQueries(fn () => $this->getJson(route('alumni.map-data'))->assertOk());

        $this->seedVariedProfiles(16);
        $manyQueries = $this->countQueries(fn () => $this->getJson(route('alumni.map-data'))->assertOk());

        $this->assertSame($fewQueries, $manyQueries);
    }

    /**
     * Creates approved profiles that each own a distinct province, regency, and program,
     * so an unloaded relationship would add one query per row.
     */
    private function seedVariedProfiles(int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $this->sequence++;
            $province = Province::create(['code' => 'P'.$this->sequence, 'name' => 'Provinsi '.$this->sequence, 'latitude' => -7.5, 'longitude' => 112.5]);
            $regency = Regency::create(['province_id' => $province->id, 'code' => 'R'.$this->sequence, 'name' => 'Wilayah '.$this->sequence, 'type' => 'kabupaten', 'latitude' => -7.82 + ($this->sequence / 1000), 'longitude' => 112.01]);
            AlumniProfile::factory()->approved()->create([
                'province_id' => $province->id,
                'regency_id' => $regency->id,
                'program_id' => Program::factory()->create()->id,
                'angkatan' => (string) (2000 + $this->sequence),
                'profession' => 'Profesi '.$this->sequence,
            ]);
        }
    }

    private function countQueries(callable $request): int
    {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $request();
        $queries = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $queries;
    }
}
