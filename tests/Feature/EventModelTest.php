<?php

namespace Tests\Feature;

use App\EventStatus;
use App\EventType;
use App\Models\Category;
use App\Models\Event;
use Database\Seeders\DemoUserSeeder;
use Database\Seeders\EventSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_slugs_are_unique_stable_and_reserve_deleted_slugs(): void
    {
        $first = Event::factory()->create(['title' => 'Kajian Bersama']);
        $first->update(['title' => 'Judul baru']);
        $this->assertSame('kajian-bersama', $first->slug);
        $first->delete();
        $this->assertSame('kajian-bersama-2', Event::factory()->create(['title' => 'Kajian Bersama'])->slug);
    }

    public function test_date_scopes_partition_ongoing_upcoming_and_past_at_the_boundary(): void
    {
        $this->freezeTime();
        $future = Event::factory()->published()->create();
        $ongoing = Event::factory()->published()->ongoing()->create();
        $past = Event::factory()->published()->past()->create();
        $boundary = Event::factory()->published()->create(['start_at' => now()->subHour(), 'end_at' => now()]);
        $this->assertSame('upcoming', $future->phase);
        $this->assertSame('ongoing', $ongoing->phase);
        $this->assertSame('past', $past->phase);
        $this->assertSame('past', $boundary->phase);
        $this->assertSame([$future->id, $ongoing->id], Event::upcoming()->orderBy('id')->pluck('id')->all());
        $this->assertSame([$past->id, $boundary->id], Event::past()->orderBy('id')->pluck('id')->all());
    }

    public function test_published_search_keeps_drafts_private_and_includes_cancelled_events(): void
    {
        Event::factory()->create(['summary' => 'Kajian']);
        $published = Event::factory()->published()->create(['title' => 'Kajian kitab']);
        $cancelled = Event::factory()->cancelled()->create(['title' => 'Kajian daring']);
        Event::factory()->published()->create(['title' => 'Seminar', 'summary' => 'Pendidikan']);
        $this->assertSame([$published->id, $cancelled->id], Event::published()->search('Kajian')->orderBy('id')->pluck('id')->all());
    }

    public function test_seeder_covers_status_and_phase_combinations_and_is_repeatable(): void
    {
        $this->seed([DemoUserSeeder::class, EventSeeder::class]);
        $this->seed(EventSeeder::class);
        $this->assertDatabaseCount('events', 10);
        $this->assertSame(1, Event::where('status', EventStatus::Draft)->count());
        $this->assertSame(1, Event::where('status', EventStatus::Cancelled)->count());
        $this->assertSame(9, Event::published()->count());
        $this->assertSame(1, Event::where('type', EventType::Online)->count());
        $this->assertSame(1, Event::where('type', EventType::Hybrid)->count());
        $this->assertSame(2, Event::past()->count());
        $this->assertSame(2, Event::where('start_at', '<=', now())->where('end_at', '>', now())->count());
        $this->assertSame(8, Event::upcoming()->count());
        $this->assertSame(6, Category::where('slug', 'kegiatan-santri')->firstOrFail()->events()->count());
        $this->assertSame(3, Category::where('slug', 'kajian')->firstOrFail()->events()->count());
    }
}
